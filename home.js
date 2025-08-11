  ; (w => {
        w.addEventListener('DOMContentLoaded', () => {
            const $ = jQuery;
            const selector = '.make-select2 select, #form-field-departure_select, #form-field-destination_select';

            // Handle clicking on modal overlay to close
            document.querySelector('.native-modal-overlay').addEventListener('click', function () {
                closeFlightTypeModal();
            });

            // Handle Escape key to close modal
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && document.getElementById('flightTypeModal').style.display !== 'none') {
                    closeFlightTypeModal();
                }
            });

            $(document).on('submit', '.elementor-form', function (e) {
                // Prevent the default form submission
                e.preventDefault();

                deleteUnusedLocalStorage();
                // Show an alert message
                saveToLocalStorage();
            });

            function formatAirport(airport) {
                if (airport.loading) {
                    return airport.text
                }
                return $(
                    '<span><img width="24" src="' + "https://flagcdn.com/w160/" + (airport.iso_country.toString().toLowerCase() ?? "") + '.png" class="select-image" /> ' + airport.text + '</span><hr style="margin: 0px; padding: 0px;"><span>' + (airport.city.toString().length > 1 ? airport.city + ", " : "") + airport.country + '</span>');
            }

            function formatRepoSelection(repo) {
                return repo.full_name || repo.text;
            }

            $('.make-select2 select, #form-field-departure_select, #form-field-destination_select').select2({
                ajax: {
                    url: `${hopon.url}/airport.php`,
                    dataType: 'json',
                    delay: 250,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    data: function (params) {
                        return {
                            q: params.term, // user's input in the search box
                            page: params.page || 0,
                            limit: 10
                        };
                    },
                    processResults: function (data, params) {
                        params.page = params.page || 0;
                        return {
                            results: data,
                        };
                    },
                },
                cache: true,
                debug: true,
                templateResult: formatAirport,
                // placeholder: 'Enter the airport name',
                minimumInputLength: 1, // minimum number of characters before the search is performed
                // placeholder: 'Enter the airport name',
                dropdownCssClass: "bigdrop"
            });
        });
    })(window);

    function initializeDateandTime(selectorForDate, selectorForTime) {
        // Get today's date
        const today = new Date();

        // Format the date as YYYY-MM-DD
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        if (month < 10) {
            month = '0' + month; // Prefix single digit months with a '0'
        }
        let day = today.getDate();
        if (day < 10) {
            day = '0' + day; // Prefix single digit days with a '0'
        }

        // Set the input value to today's date
        document.querySelector(selectorForDate).value = `${year}-${month}-${day}`;


        // Get the current time

        // Extract hours and minutes
        let hours = today.getHours();
        let minutes = today.getMinutes();

        // Format hours and minutes as HH:MM
        if (hours < 10) {
            hours = '0' + hours; // Prefix single digit hours with a '0'
        }
        if (minutes < 10) {
            minutes = '0' + minutes; // Prefix single digit minutes with a '0'
        }

        // Set the input value to the current time
        document.querySelector(selectorForTime).value = `${hours}:${minutes}`;
    }
    function fetchData(departure, destination) {
        jQuery.get(`${hopon.url}/airport.php?departure=${departure}&destination=${destination}`, function (data) {
            //the result is : {"departure":{"id":"4490","text":"Geneva Cointrin International Airport | GVA","city":"Geneva","country":"Switzerland","iso_country":"CH"},"destination":{"id":"26638","text":"Don Mueang International Airport | DMK","city":"Bangkok","country":"Thailand","iso_country":"TH"}}
            //set into select2 
            //set options with text and value and select them
            localStorage.setItem('data_airport_redirect', data);
            window.location.href = `${hopon.url}/business-first-fr/`;
        });
    }
    function setEventForJetListingGrid() {
        document.querySelectorAll('.slick-track .jet-listing-grid__item').forEach(function (item) {
            //get the 5th element of h2 elementor-heading-title
            const departure_airport_id = item.querySelectorAll('.id_departure')[0].textContent;
            const departure_arrival_id = item.querySelectorAll('.id_destination')[0].textContent;
            // Add click event to the entire div
            item.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                fetchData(departure_airport_id, departure_arrival_id);
                return false;
            }, true);

            var button = item.querySelector('.elementor-button');
            if (button) {
                // Remove any href attribute if it's a link
                if (button.tagName === 'A') {
                    button.removeAttribute('href');
                }
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    fetchData(departure_airport_id, departure_arrival_id);
                    return false;
                }, true);
            }
        });
    }
    window.onload = () => {
        deleteUnusedLocalStorage();
        initializeDateandTime('#date', '#time');
        initializeFlatpickr();
        selectFlightType('Private');
        setTimeout(() => {
            setEventForJetListingGrid();
        }, 500);
    }
    var inputDate = null;
    var inputTime = null;
    initializeFlatpickr = () => {
        inputDate = flatpickr("#date", {});
        inputTime = flatpickr("#time", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i", // Specify the time format (e.g., "H:i" for 24-hour format)
            time_24hr: true // Use 24-hour format if needed
        });
    }
    function deleteUnusedLocalStorage() {
        localStorage.clear();
    }
    function navigate(page) {
        window.location.href = `${hopon.url}/${page}/`;
    }
    function getLanguage() {
        const url = window.location.href;

        // Split the URL by "/"
        const parts = url.split('/');

        // Iterate over the parts to find the language code
        let languageCode = null;
        for (let i = 0; i < parts.length; i++) {
            // Check if the part contains a language code
            if (/^[a-zA-Z]{2}$/.test(parts[i])) { // Assuming language code is 2 characters long
                languageCode = parts[i];
                break;
            }
        }

        if (languageCode === null) {
            return "en";
        } else {
            return languageCode; // Output: fr
        }
    }
    function processFlight(option) {
        const departure = jQuery('#form-field-departure_select').val();
        const destination = jQuery('#form-field-destination_select').val();
        const date = jQuery('#date').val();
        const time = jQuery('#time').val();
        const passengers = jQuery('#passengers').val();
        const jet_size = jQuery('#jet_size').val();
        const contact_information_url = {
            'en': 'contact-information-page',
            'fr': 'contact-information-page-fr',
            'ar': 'contact-information-page-ar',
        }
        const round_trip_url = {
            'en': 'round-trip-and-add-flight-page',
            'fr': 'round-trip-and-add-flight-page-fr',
            'ar': 'round-trip-and-add-flight-page-ar',
        }

        const flights = [];
        flights.push({ 'departure_id': departure, 'destination_id': destination, 'jet_size': jet_size, 'date': date, 'time': time, 'passengers': passengers })

        let validationOk = false;
        if (option == 1 || option == 2 || option == 3)
            validationOk = checkValidation(['#form-field-departure_select', '#form-field-destination_select', '#date', '#time'])

        if (!validationOk) return alert('Field must be filled first');

        if (!isDateHigher(date)) return alert('Date must be today or a future date.');

        if (option == 1 || option == 2 || option == 3) {
            if (option == 2) {
                flights.push({ 'departure_id': destination, 'destination_id': departure, 'jet_size': jet_size, 'date': date, 'time': time, 'passengers': passengers });
            } else if (option == 3) {
                flights.push({ 'departure_id': null, 'destination_id': null, 'jet_size': jet_size, 'date': date, 'time': time, 'passengers': passengers });
            }
            localStorage.setItem('flights', JSON.stringify(flights));
            if (option == 1) navigate(contact_information_url[getLanguage()]);
            // if (getLanguage() == "en") navigate('contact-information-page');
            // else if (getLanguage() == "fr") navigate('contact-information-page-fr');
            // else if (getLanguage() == "ar") navigate('contact-information-page-fr');
            // navigate(contact_information_url[getLanguage()]);
            else if (option == 2 || option == 3) navigate(round_trip_url[getLanguage()]);
        }
    }

    function isDateHigher(date) {
        const inputDateObject = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDateObject > today) return true;
        return false;
    }

    function checkValidation(listSelector) {
        let validationOk = true;
        listSelector.forEach((selector) => {
            if (document.querySelector(selector).value.length == 0) validationOk = false;
        })
        return validationOk;
    }

    // Native Modal Functions
    function openFlightTypeModal() {
        document.getElementById('flightTypeModal').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeFlightTypeModal() {
        document.getElementById('flightTypeModal').style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    function selectFlightType(flightType) {
        // Update button text
        const text_multilanguage = {
            "en": {
                "Flight Type Button":
                {
                    "Private": "Private",
                    "Business": "Business",
                    "First": "First"
                }
            },
            "fr": {
                "Flight Type Button":
                {
                    "Private": "Privé",
                    "Business": "Entreprise",
                    "First": "D'abord"
                }
            },
            "ar": {
                "Flight Type Button":
                {
                    "Private": "خاص",
                    "Business": "عمل",
                    "First": "أولاً"
                }
            }
        };
        const flightTypeText = text_multilanguage[getLanguage()]["Flight Type Button"];
        console.log(flightTypeText[flightType]);
        document.querySelector('.flight-type-btn span').textContent = flightTypeText[flightType];

        // Store selection in localStorage
        localStorage.setItem('flight_type', flightType);

        // Close modal
        closeFlightTypeModal();
    }
