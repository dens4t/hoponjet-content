    document.addEventListener('DOMContentLoaded', () => {
        // Handle clicking on modal overlay to close
        const overlay = document.querySelector('.native-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', function () {
                closeFlightTypeModal();
            });
        }

        // Handle Escape key to close modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.getElementById('flightTypeModal').style.display !== 'none') {
                closeFlightTypeModal();
            }
        });
    });

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
        document.querySelector('.flight-type-btn span').textContent = flightTypeText[flightType];

        // Store selection in localStorage
        localStorage.setItem('flight_type', flightType);

        // Close modal
        closeFlightTypeModal();
    }

    const $ = jQuery;
    var currentIndex = 0;

    function fetchData(departure, destination, callback) {
        $.get(`${hopon.url}/airport.php?departure=${departure}&destination=${destination}`, callback);
    }
    function formatAirport(airport) {
        if (airport.loading) {
            return airport.text
        }
        return $(
            '<span><img width="48" src="' + "https://flagcdn.com/w160/" + (airport.iso_country.toString().toLowerCase() ?? "") + '.png" class="select-image" /> ' + airport.text + '</span><hr style="margin: 0px; padding: 0px;"><span>' + (airport.city.toString().length > 1 ? airport.city + ", " : "") + airport.country + '</span>');
    }
    function removeElement(selector) {
        if ($(".flight_elements").children().length == 1) return;
        if (confirm('Delete this round trip?')) {
            $(selector).remove();
        }
    }
    function checkValidations() {
        let validationOK = true;
        Array.from(document.querySelector('.flight_elements').children).forEach((element, index) => {
            const id = $(element).data('id');
            const departure = element.querySelector(`#${id}_form-field-departure_select`).value ?? "";
            const destination = element.querySelector(`#${id}_form-field-destination_select`).value ?? "";
            const date = element.querySelector(`#${id}_date`).value ?? "";
            const time = element.querySelector(`#${id}_time`).value ?? "";
            const passengers = element.querySelector(`#${id}_passengers`).value ?? "";
            if (departure == "null" || destination == "null" || date == "" || time == "" || passengers == "") {
                validationOK = false;
            }
        });
        return validationOK;
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
    function navigate(page) {
        window.location.href = `${hopon.url}/${page}/`;
    }
    function proceedFlightOrder() {
        let flights = [];
        const contact_information_url = {
            'en': 'contact-information-page',
            'fr': 'contact-information-page-fr',
            'ar': 'contact-information-page-ar',
        }
        if (!checkValidations()) return alert('All form must be filled');
        Array.from(document.querySelector('.flight_elements').children).forEach((element, index) => {
            const id = $(element).data('id');
            const departure = element.querySelector(`#${id}_form-field-departure_select`).value ?? "";
            const destination = element.querySelector(`#${id}_form-field-destination_select`).value ?? "";
            const date = element.querySelector(`#${id}_date`).value ?? "";
            const time = element.querySelector(`#${id}_time`).value ?? "";
            const passengers = element.querySelector(`#${id}_passengers`).value ?? "";
            flights.push({ 'departure_id': departure, 'destination_id': destination, 'date': date, 'time': time, 'passengers': passengers });
        });
        localStorage.setItem('flights', JSON.stringify(flights));
        return navigate(contact_information_url[getLanguage()]);

        //  const flights = [{'departure_id': departure, 'destination_id': destination, 'date': date, 'time': time, 'passengers': passengers}];
    }

    function initializeJetSize(selector, value) {
        document.querySelector(selector).value = value ?? "";
    }

    function initializeDateandTime(selectorForDate, selectorForTime, date = null, time = null) {
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
        if (date == null) document.querySelector(selectorForDate).value = `${year}-${month}-${day}`;
        else document.querySelector(selectorForDate).value = date;

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
        if (time == null) document.querySelector(selectorForTime).value = `${hours}:${minutes}`;
        else document.querySelector(selectorForTime).value = time;

    }
    function makeid(length) {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    function addFlight(index, data = null, after = false) {
        const departure = {
            'id': null,
            'text': 'Departure Airport'
        };

        const destination = {
            'id': null,
            'text': 'Destination Airport'
        };
        let time = null;
        let date = null;
        let passengers = 1;
        // console.log({'data' : data, 'jet_size' : data.jet_size});
        if (data != null) {
            departure['id'] = data.departure?.id ?? departure.id;
            departure['text'] = data.departure?.text ?? departure.text;

            destination['id'] = data.destination?.id ?? destination.id;
            destination['text'] = data.destination?.text ?? destination.text;
            time = data.time;
            date = data.date;
            passengers = data.passengers;
        }
        const randomId = makeid(5);
        const parentElementId = `${randomId}_flight_element`;
        const html = `<div class="flight-element" id="${parentElementId}" data-id="${randomId}">
    <div class="row no-margin flight-element-label"
        style="background-color:whitesmoke; color: #121921; max-height: 30px; font-size: 13px; font-weight: 500;">
        <div class="col-lg-7" style="border-right: 1px solid #DDDDDD;">
            Airports Selection
        </div>
        <div class="col-lg-3" style="border-right: 1px solid #DDDDDD;">
            Departure Date & Time
        </div>
        <div class="col-lg-1" style="border-right: 1px solid #DDDDDD;">
            Passengers
        </div>
        <div class="col-lg-1">
            Action
        </div>
    </div>
    <div class="row no-margin" style="background-color:whitesmoke;">
        <div class="col-lg-7 form-no-padding" style="background-color:white;">
            <div class="col-lg-12 border-top" style="padding-top: 5px; padding-bottom: 5px;">
                <select name="" class="make-select2 w-100" id="${randomId}_form-field-departure_select"
                    placeholder="Departure Airport">
                    <option value="${departure.id}">${departure.text}</option>
                </select>
            </div>
            <div class="col-lg-12 border-top" style="padding-top: 5px; padding-bottom: 5px;">
                <select name="" class="make-select2 w-100" id="${randomId}_form-field-destination_select" 
                    placeholder="Destination Airport">
                    <option value="${destination.id}">${destination.text}</option>
                </select>
            </div>
        </div>
        <div class="col-lg-3 form-no-padding">
            <div class="col-lg-12 form-no-padding input-group border-top">
                <input class="form-control border-0 rounded-0" id="${randomId}_date" name="type" onfocus="this.showPicker()" type="date" />
            </div>
            <div class="col-lg-12 form-no-padding input-group border-top">
                <input class="form-control border-0 rounded-0" id="${randomId}_time" name="time" onfocus="this.showPicker()" type="time" />
            </div>
        </div>
        <div class="col-lg-1 form-no-padding"
            style="padding: 5px; display:flex; align-items: center; border-left: 1px solid #DDDDDD; background-color: white;">
            <div class="col-lg-12 form-no-padding input-group">
                <div class="input-group-prepend" id="input-group-passengers-prepend">
                    <div class="input-group-text h-100 border-0 rounded-0"
                        style="padding: 0px 0px 0px 5px; background-color: white;"><i aria-hidden="true"
                            class="fas fa-user-alt"></i>
                        <input type="number" name="passengers" id="${randomId}_passengers" class="form-control h-100 border-0 rounded-0" step="1"
                            value="1" min="1" style="padding: 0px 0px 0px 10px; background-color: white;">
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-1 form-no-padding">
            <button type="submit" onclick="removeElement('#${randomId}_flight_element')" class="btn-trash w-100 h-100 rounded-0"><i aria-hidden="true"
                    class="fas fa-trash"></i></i></button>
        </div>
    </div>
</div>`;
        if (after) $('.flight_elements').last().append(html);
        else $('.flight_elements').first().append(html).hide().show('slow');

        initializeDateandTime(`#${randomId}_date`, `#${randomId}_time`, date, time);
        initSelect(`#${randomId}_form-field-departure_select, #${randomId}_form-field-destination_select`);
        currentIndex = index;
        return document.querySelector(`#${parentElementId}`);
    }
    function initSelect(selector = '.select2') {
        console.log({ 'selector': selector });
        $(selector).select2({
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
                        results: data
                    };
                },
            },
            cache: true,
            debug: true,
            templateResult: formatAirport,
            // placeholder: 'Enter the airport name',
            minimumInputLength: 1, // minimum number of characters before the search is performed
            // placeholder: 'Enter the airport name',
            dropdownAutoWidth: true,
            width: 'auto'
        })
    }
    window.onload = () => {
        $('#btn-process-flight').on('click', (event) => {
            event.preventDefault();
            proceedFlightOrder();
        })
        $('#btn-more-flight').on('click', (event) => {
            event.preventDefault();
            addFlight(currentIndex + 1, null, true);
        })
        var items = JSON.parse(localStorage.getItem('flights')) ?? null;
        if (items == null) return alert('Flights not available');
        items.forEach((item, index) => {
            const departure = item.departure_id;
            const destination = item.destination_id;
            const date = item.date;
            const time = item.time;
            const passengers = item.passengers;
            fetchData(departure, destination, (data) => {
                data = JSON.parse(data);
                data = { ...data, 'date': date, 'time': time, 'passengers': passengers };
                addFlight(index, data, false);
                // initSelect();
            });
        });

        selectFlightType(localStorage.getItem('flight_type'));

    }
        ; (w => {
            w.addEventListener('DOMContentLoaded', () => {
                const $ = jQuery;
                const selector = '.make-select2 select, #form-field-departure_select, #form-field-destination_select';

                $(document).on('submit', '.elementor-form', function (e) {
                    // Prevent the default form submission
                    e.preventDefault();

                    deleteUnusedLocalStorage();
                    // Show an alert message
                    saveToLocalStorage();
                });

                function deleteUnusedLocalStorage() {
                    localStorage.removeItem('jet_name');
                }

                function saveToLocalStorage() {
                    const departure = $('#form-field-departure_select').val();
                    const destination = $('#form-field-destination_select').val();
                    const date = $('#form-field-date_picker').val();
                    localStorage.setItem('departure_id', departure);
                    localStorage.setItem('destination_id', destination);
                    localStorage.setItem('date', date);
                }


                function formatRepoSelection(repo) {
                    return repo.full_name || repo.text;
                }

            });
        })(window);
