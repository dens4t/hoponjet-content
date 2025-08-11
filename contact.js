function fetchData(departure, destination, callback) {
        $.get(`${hopon.url}/airport.php?departure=${departure}&destination=${destination}`, callback);
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


    function redirectifEmpty() {
        if (document.referrer == '') return window.location.href = hopon.url;
        if (document.referrer.indexOf('jets-database/') !== -1) $('#jet').css('display', '')
    }
    function loadCustomer(){
        setTimeout(() => {
            const detail_customer = JSON.parse(localStorage.getItem('detail_customer'));
            console.log('Ini load customer!', detail_customer);
            document.querySelector('#name').value = detail_customer?.name ?? '';
            document.querySelector('#lastname').value = detail_customer?.lastname ?? '';
            document.querySelector('#email').value = detail_customer?.email ?? '';
            document.querySelector('#telephone').value = detail_customer?.telephone ?? '';
            document.querySelector('#additional').value = detail_customer?.additional ?? '';
        }, 1000);
    }
    window.onload = () => {
        redirectifEmpty();

        function removeCurrentForm(){
            $('#form-field-from').remove();
            $('#form-field-to').remove();
            $('#form-field-date').remove();
            $('#form-field-time').remove();
            $('#form-field-passengers').remove();
        }
        function addArrayForm(index,fromValue, toValue, dateValue, timeValue,passengersValue){   
            $('div.elementor-element.elementor-element-4fcad03.elementor-widget__width-inherit.elementor-button-align-stretch.elementor-widget.elementor-widget-form > div > form').last().append(`
                <div class="form_flight">
                    <input type="hidden" name="from[${index}]" value="${fromValue}">
                    <input type="hidden" name="to[${index}]" value="${toValue}">
                    <input type="hidden" name="date[${index}]" value="${dateValue}">
                    <input type="hidden" name="time[${index}]" value="${timeValue}">
                    <input type="hidden" name="passengers[${index}]" value="${passengersValue}">
                </div>
            `);
        }
        removeCurrentForm();

        var items = JSON.parse(localStorage.getItem('flights')) ?? null;
        var flight_type = localStorage.getItem('flight_type');
        if (items == null) return;
        items.forEach((item, index) => {
            const departure = item.departure_id;
            const destination = item.destination_id;
            const date = item.date;
            const time = item.time;
            const jet_size = item.jet_size ?? "optional";
            const passengers = item.passengers;
            fetchData(departure, destination, (data) => {
                data = JSON.parse(data);
                const randomId = makeid(5);
                const datadeparture = data.departure.text;
                const datadestination = data.destination.text
				const jetElement = (item.jet_name ? `<tr>
            <td valign="top" width="30%">Jet Name</td>
            <td style="font-weight:bold">: <span id="departure">${item.jet_name}</span></td>
        </tr>` : "");
                const html= `<tr class="flight-element" data-id="${randomId}">
            <td valign="top" width="30%" colspan='2' align="center"><i class="fas fa-fighter-jet"></i>
    Your Flight — ${flight_type}</td>
        </tr>
        ${jetElement}
		<tr>
            <td valign="top" width="30%">From</td>
            <td style="font-weight:bold">: <span id="departure">${datadeparture}</span></td>
        </tr>
        <tr>
            <td valign="top" width="30%">To</td>
            <td style="font-weight:bold">: <span id="destination">${datadestination}</span></td>
        </tr>
        <tr>
            <td valign="top" width="30%">Jet Size</td>
            <td style="font-weight:bold">: <span id="date">${jet_size.toLowerCase() == "optional" ? "<i>(" + jet_size +")</i>" : jet_size}</span></td>
        </tr>
        <tr>
            <td valign="top" width="30%">Date</td>
            <td style="font-weight:bold">: <span id="date">${date}</span></td>
        </tr>
        <tr>
            <td valign="top" width="30%">Time</td>
            <td style="font-weight:bold">: <span id="time">${time}</span></td>
        </tr>
        <tr>
            <td valign="top" width="30%">Passengers</td>
            <td style="font-weight:bold">: <span id="passengers"> ${passengers}</span></td>
        </tr>`;
                // $('#flights').hide().show('normal').last().append(html);

                $(html).appendTo($('#flights'));
                // console.log(html);
                addArrayForm(index,datadeparture, datadestination, date, time, passengers);
                items[index] = {
                    ...items[index],
                    'departure': data.departure.text,
                    'departure_country': data.departure.country,
                    'departure_flag': data.departure.iso_country,
                    'destination': data.destination.text,
                    'destination_country': data.destination.country,
                    'destination_flag': data.destination.iso_country,
                };

                localStorage.setItem('flights', JSON.stringify(items));
            });
        });
        
        loadCustomer();
    } 

    function saveToLocalStorage() {
        const name = document.querySelector('#name').value;
        localStorage.setItem('cust_name', name);
    }
    function passingDataFromElementorForm7() {
        $('#form-field-name').val($('#name').val())
        $('#form-field-lastname').val($('#lastname').val())
        $('#form-field-email').val($('#email').val())
        $('#form-field-telephone').val($('#telephone').val())
        $('#form-field-additional').val($('#additional').val())
        $('#form-field-promocode').val($('#promocode').val())
    }
    jQuery(document).ready(function ($) {
        // Assuming you are sending an AJAX request when a button with class "submit-btn" is clicked
        $('button[type="submit"]').click(function (e) {
            $(this).prop('disabled', true).addClass('processing');
            setTimeout(() => {
                return validation(e, this);
            }, 2000);
        });
    });

    function validation(e, btn) {
        e.preventDefault();
        if (document.querySelector('#promocode').value.trim().length == 0) return doSubmit(e, btn);
        return checkingPromoCode(e, btn);
    }

    function checkingPromoCode(e, btn) {
        $(btn).prop('disabled', true).addClass('processing');
        const code = document.querySelector('#promocode').value;
        $.get('https://script.google.com/macros/s/AKfycbxcUyfNFlntdz_ScIxD3HjOvW5jhODvxNA1R3N2kB59hUuBqM1A078TMXtTdC7pKUcrqw/exec?checkCode=' + code).then((res) => {
            if (res.success) doSubmit(e, btn);
            else {
                alert('The code is not valid');
                $(btn).prop('disabled', false).removeClass('processing');
            }
        })
    }

    function doSubmit(e, btn) {
        passingDataFromElementorForm7();
        e.preventDefault();
        
        // Validate reCAPTCHA v3 before submitting
        validateRecaptchaV3().then(function(isValid) {
            if (isValid) {
                console.log('✅ reCAPTCHA v3 validation passed');
                submitForm(btn);
            } else {
                console.log('❌ reCAPTCHA v3 validation failed');
                alert('Please verify that you are human and try again.');
                $(btn).prop('disabled', false).removeClass('processing');
            }
        }).catch(function(error) {
            console.error('reCAPTCHA validation error:', error);
            alert('reCAPTCHA validation failed. Please try again.');
            $(btn).prop('disabled', false).removeClass('processing');
        });
    }

    function validateRecaptchaV3() {
        return new Promise((resolve, reject) => {
            console.log('Starting reCAPTCHA v3 validation...');
            
            // Check if reCAPTCHA is loaded
            if (typeof grecaptcha === 'undefined') {
                console.error('❌ reCAPTCHA not loaded - grecaptcha is undefined');
                alert('reCAPTCHA failed to load. Please refresh the page and try again.');
                resolve(false);
                return;
            }
            
            console.log('✅ grecaptcha object found');
            
            grecaptcha.ready(function() {
                console.log('✅ reCAPTCHA ready, executing with site key...');
                
                grecaptcha.execute('6LeP6aArAAAAANMzn5GjytB9FTBqy_z8pWF7F_mp', {action: 'Form'}).then(function(token) {
                    console.log('✅ reCAPTCHA v3 token generated successfully');
                    console.log('Token length:', token.length);
                    console.log('Token preview:', token.substring(0, 20) + '...');
                    
                    // For client-side validation, we'll just check if token exists
                    // In production, you should send this token to your server for verification
                    if (token && token.length > 0) {
                        resolve(true);
                    } else {
                        console.error('❌ Invalid token received');
                        resolve(false);
                    }
                }).catch(function(error) {
                    console.error('❌ Error executing reCAPTCHA:', error);
                    console.error('Error details:', error.message);
                    alert('reCAPTCHA validation failed: ' + error.message);
                    resolve(false);
                });
            });
        });
    }

    function submitForm(btn) {
        saveToLocalStorage();
        $(btn).prop('disabled', true).addClass('processing');
        
        // Get reCAPTCHA token for form submission
        grecaptcha.ready(function() {
            grecaptcha.execute('6LeP6aArAAAAANMzn5GjytB9FTBqy_z8pWF7F_mp', {action: 'Form'}).then(function(token) {
                $.ajax({
                    url: "https://hopon-jet.com/wp-admin/admin-ajax.php",
                    type: 'POST',
                    data: {
                        post_id: 8,
                        form_id: "4fcad03",
                        referer_title: "Contact Information Page",
                        query_id: 8,
                        action: 'elementor_pro_forms_send_form',
                        'g-recaptcha-response': token, // Include reCAPTCHA token
                        form_fields: {
                            name: $('#form-field-name').val(),
                            lastname: $('#form-field-lastname').val(),
                            email: $('#form-field-email').val(),
                            telephone: $('#form-field-telephone').val(),
                            additional: $('#form-field-additional').val(),
                            promocode: $('#form-field-promocode').val(),
                            flights: btoa(localStorage.getItem('flights')),
                            flight_type: localStorage.getItem('flight_type'),
                            'g-recaptcha-response': token // Also include in form_fields for Elementor
                        }
                    },
                    success: function (response) {
                        console.log(response);
                        if (response.success) {
                            window.location.href = `${hopon.url}/thank-you-page`;
                        } else {
                            console.log('Error:', response.data.message);
                            alert('Form submission failed. Please try again.');
                            $(btn).prop('disabled', false).removeClass('processing');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.log('AJAX Error:', error);
                        alert('Network error. Please check your connection and try again.');
                        $(btn).prop('disabled', false).removeClass('processing');
                    }
                });
            }).catch(function(error) {
                console.error('Error getting reCAPTCHA token for submission:', error);
                alert('reCAPTCHA error. Please try again.');
                $(btn).prop('disabled', false).removeClass('processing');
            });
        });
    }
