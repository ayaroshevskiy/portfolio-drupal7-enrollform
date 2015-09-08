(function ($) {
    Drupal.behaviors.kcc_enrollform = {
        attach: function (context, settings) {
            var form = $('form.webform-client-form', context);
            var validator = form.validate();

            var popupValidator = null;

            form.find('.add-school-popup').addClass('mfp-hide');
            form.find('.add-inst-popup').addClass('mfp-hide');

            validateEducationHistory();
            initHistoryRemove();

            $('#btn-add-inst-popup', context).magnificPopup({
                preloader: false,
                items: {
                    src: '.add-inst-popup',
                    type: 'inline'
                },
                midClick: true,

                callbacks: {
                    open: function() {
                        this.content.wrap('<form></form>');
                        initInstGradSelect(this.content);
                        initInstStateSelect(this.content);
                        popupValidator = this.content.closest('form').validate();
                    },
                    close: function() {
                        this.content.closest('form').trigger('reset');
                    }
                }
            });

            function initInstGradSelect(context){
                var _grad_date_div = $('select[name*="institution_graduation_date"]', context).closest('div.form-type-date');
                _grad_date_div.hide();

                $('select[name*="institution_other_degree"]', context).change(function(){
                    var _val = $(this).val();
                    if (_val && _val != 'NoD') {
                        _grad_date_div.show();
                    } else {
                        _grad_date_div.hide();
                    }
                });
            }

            function initInstStateSelect(context){
                var _inst_div = $('select[name*="[institutions]"]', context).closest('div');
                var _start_date_div = $('select[name*="institution_start_date"]', context).closest('div.form-type-date');
                var _end_date_div = $('select[name*="institution_end_date"]', context).closest('div.form-type-date');
                _inst_div.hide();
                _start_date_div.hide();
                _end_date_div.hide();

                $('select[name*="institution_state"]', context).change(function(){
                    var _val = $(this).val();
                    if (_val) {
                        _inst_div.show();
                        _start_date_div.show();
                        _end_date_div.show();
                    } else {
                        _inst_div.hide();
                        _start_date_div.hide();
                        _end_date_div.hide();
                    }
                    updateInstSelect(context);
                });
            }

            function updateInstSelect(context){
                var inst_state_select = context.find('select[name*="institution_state"]');
                var inst_state = inst_state_select.is(':visible') ? inst_state_select.val() : '';

                var institutions = getInstitutions(inst_state);
                reloadSelect(institutions, context.find('select[name*="[institutions]"]'));
            }

            function getInstitutions(state){
                if (state == '170000') {
                    return _.filter(Drupal.settings.kcc_enrollform.institutions, function (row) {
                        return row.state.indexOf('17') === 0;
                    });
                }
                return _.where(Drupal.settings.kcc_enrollform.institutions, {state: state});
            }

            $('#add-inst-history', context).click(function(){
                if (popupValidator) {
                    if (popupValidator.form()) {
                        var type = 'I';
                        var degree_select = $('select[name*="institution_other_degree"]', context);
                        var degree_code = degree_select.is(':visible') ? degree_select.val() : '';

                        var inst_select = $('select[name*="[institutions]"]', context);
                        var inst_code = inst_select.is(':visible') ? inst_select.val() : '';

                        var inst_label = inst_select.is(':visible') ? inst_select.find('option:selected').text() : '';

                        var graduation_date = '';
                        if ($('select[name*="[institution_graduation_date][day]"]', context).is(':visible')) {
                            var graduation_date_day_select = $('select[name*="[institution_graduation_date][day]"]', context);
                            var graduation_date_day_val = graduation_date_day_select.val();
                            graduation_date_day_val = graduation_date_day_val < 10 ? '0' + graduation_date_day_val : graduation_date_day_val;

                            var graduation_date_month_select = $('select[name*="[institution_graduation_date][month]"]', context);
                            var graduation_date_month_val = graduation_date_month_select.val();
                            graduation_date_month_val = graduation_date_month_val < 10 ? '0' + graduation_date_month_val : graduation_date_month_val;

                            var graduation_date_year_select = $('select[name*="[institution_graduation_date][year]"]', context);
                            var graduation_date_year_val = graduation_date_year_select.val();

                            graduation_date = graduation_date_day_val + '-' + graduation_date_month_val + '-' + graduation_date_year_val;
                        }

                        var start_date_day_select = $('select[name*="[institution_start_date][day]"]', context);
                        var start_date_day_val = start_date_day_select.val();
                        start_date_day_val = start_date_day_val < 10 ? '0' + start_date_day_val : start_date_day_val;

                        var start_date_month_select = $('select[name*="[institution_start_date][month]"]', context);
                        var start_date_month_val = start_date_month_select.val();
                        start_date_month_val = start_date_month_val < 10 ? '0' + start_date_month_val : start_date_month_val;

                        var start_date_year_select = $('select[name*="[institution_start_date][year]"]', context);
                        var start_date_year_val = start_date_year_select.val();

                        var start_date = start_date_day_val + '-' + start_date_month_val + '-' + start_date_year_val;

                        var end_date_day_select = $('select[name*="[institution_end_date][day]"]', context);
                        var end_date_day_val = end_date_day_select.val();
                        end_date_day_val = end_date_day_val < 10 ? '0' + end_date_day_val : end_date_day_val;

                        var end_date_month_select = $('select[name*="[institution_end_date][month]"]', context);
                        var end_date_month_val = end_date_month_select.val();
                        end_date_month_val = end_date_month_val < 10 ? '0' + end_date_month_val : end_date_month_val;

                        var end_date_year_select = $('select[name*="[institution_end_date][year]"]', context);
                        var end_date_year_val = end_date_year_select.val();

                        var end_date = end_date_day_val + '-' + end_date_month_val + '-' + end_date_year_val;

                        var insert_val = type + ',' + degree_code + ',' + graduation_date + ',' + inst_code + ',' + start_date + ',' + end_date;
                        insertEducationHistoryItem(insert_val, inst_label, 'inst-result');

                        $.magnificPopup.close();
                    }
                }

                return false;
            });

            var _schoolPopup = null;
            $('#btn-add-school-popup', context).magnificPopup({
                preloader: false,
                items: {
                    src: '.add-school-popup',
                    type: 'inline'
                },
                midClick: true,

                callbacks: {
                    open: function() {
                        this.content.wrap('<form></form>');

                        initHSTypeSelect(this.content);
                        initHSStateSelect(this.content);
                        initHSSelect(this.content);

                        popupValidator = this.content.closest('form').validate();
                    },
                    close: function() {
                        this.content.closest('form').trigger('reset');
                    }
                }
            });

            function initHSTypeSelect(context){
                $('[name*="high_school_type"]', context).change(function(){
                    if ($(this).val() == 'HS') {
                        $('[name*="high_school_state"]', context).closest('div').show();
                        $('[name*="high_schools"]', context).closest('div').hide();
                    } else if ($(this).val() == 'GED') {
                        updateHSSelect(context);
                        $('[name*="high_school_state"]', context).closest('div').hide();
                        $('[name*="high_schools"]', context).closest('div').show();
                    } else {
                        $('[name*="high_school_state"]', context).closest('div').hide();
                        $('[name*="high_schools"]', context).closest('div').hide();
                    }
                });
            }

            function initHSStateSelect(context) {
                if (!context.find('[name*="high_school_type"]').val()) {
                    $('[name*="high_school_state"]', context).closest('div').hide();
                }
                $('[name*="high_school_state"]', context).change(function(){
                    updateHSSelect(context);
                    $('[name*="high_schools"]', context).closest('div').show();
                });
            }

            function initHSSelect(context) {
                if (!context.find('[name*="high_school_type"]').val()) {
                    $('[name*="high_schools"]', context).closest('div').hide();
                }
            }

            function updateHSSelect(context){
                var hs_type_select = context.find('[name*="high_school_type"]');
                var hs_state_select = context.find('[name*="high_school_state"]');
                var hs_type = hs_type_select.is(':visible') ? hs_type_select.val() : '';
                var hs_state = hs_state_select.is(':visible') ? hs_state_select.val() : '';

                var high_schools = getHighSchools(hs_type, hs_state);
                reloadSelect(high_schools, context.find('[name*="high_schools"]'));
            }

            function getHighSchools(type, state){
                return _.where(Drupal.settings.kcc_enrollform.high_schools, {type: type, state: state});
            }

            $('#add-school-history', context).click(function(){
                if (popupValidator) {
                    if (popupValidator.form()) {
                        var type = 'S';
                        var school_type_select = $('select[name*="[high_school_type]"]', context);
                        var school_type = school_type_select.is(':visible') ? school_type_select.val() : '';
                        var school_select = $('select[name*="[high_schools]"]', context);
                        var school_code = school_select.is(':visible') ? school_select.val() : '';
                        var school_label = '';

                        if (school_type == 'FHS') {
                            school_label = school_type_select.find('option:selected').text();
                        } else {
                            school_label = school_select.is(':visible') ? school_select.find('option:selected').text() : '';
                        }

                        var graduation_date_day_select = $('select[name*="[high_school_graduation_date][day]"]', context);
                        var graduation_date_day_val = graduation_date_day_select.val();
                        graduation_date_day_val = graduation_date_day_val < 10 ? '0' + graduation_date_day_val : graduation_date_day_val;

                        var graduation_date_month_select = $('select[name*="[high_school_graduation_date][month]"]', context);
                        var graduation_date_month_val = graduation_date_month_select.val();
                        graduation_date_month_val = graduation_date_month_val < 10 ? '0' + graduation_date_month_val : graduation_date_month_val;

                        var graduation_date_year_select = $('select[name*="[high_school_graduation_date][year]"]', context);
                        var graduation_date_year_val = graduation_date_year_select.val();

                        var graduation_date = graduation_date_day_val + '-' + graduation_date_month_val + '-' + graduation_date_year_val;

                        var insert_val = type + ',' + school_type + ',' + school_code + ',' + graduation_date;
                        insertEducationHistoryItem(insert_val, school_label, 'school-result');

                        $.magnificPopup.close();
                    }
                }

                return false;
            });

            function insertEducationHistoryItem(val, label, iclass){
                var result_ul = $('ul.history-items-selected', context);

                var hinput = $('div > input[name*="institutions_attended_results"]', context).clone();

                hinput.val(val);
                hinput.attr('name', hinput.attr('name') + '[]');
                hinput.addClass(iclass);

                var li = $('<li>' + label + '</li>').append(hinput);
                result_ul.append(li);

                validateEducationHistory();
                initHistoryRemove();
            }

            function validateEducationHistory() {
                if ($('.history-items-selected input.inst-result', context).length >= 4){
                    $('#btn-add-inst-popup', context).hide();
                } else {
                    $('#btn-add-inst-popup', context).show();
                }

                if ($('.history-items-selected input.school-result', context).length >= 1){
                    $('#btn-add-school-popup', context).hide();
                } else {
                    $('#btn-add-school-popup', context).show();
                }
            }

            function initHistoryRemove(){
                $('ul.history-items-selected li', context).click(function(){
                    $('ul.history-items-selected li.item-selected', context).removeClass('item-selected');
                    $(this).addClass('item-selected');
                });
                $('#remove-history-item', context).click(function(){
                    $('ul.history-items-selected li.item-selected', context).remove();
                    validateEducationHistory();
                });
            }

            var _filter_key = null;
            var _programs_select = form.find('select[name*="datatel_acad_programs"]');
            var _programs_fieldset = _programs_select.closest('fieldset');
            var _admit_statuses = _programs_fieldset.find('select[name*="datatel_admit_statuses"]');
            var _transfer_student = _programs_fieldset.find('[name*="transfer_student"]');
            var _transfer_degree = _programs_fieldset.find('select[name*="transfer_degree"]');
            var _career_degree = _programs_fieldset.find('select[name*="career_degree"]');

            updateProgramsSelect(_admit_statuses);
            updateProgramsSelect(_transfer_degree);
            updateProgramsSelect(_career_degree);

            if (_admit_statuses.val()) {
                _admit_statuses.change();
            }

            _transfer_student.change(function(){
                _admit_statuses.change();
            });

            function updateProgramsSelect(select) {
                select.change(function(){
                    var select_val = $(this).val();
                    setTimeout(function(){
                        if (_programs_select.is(":visible")) {
                            if (select != _transfer_degree && _transfer_degree.is(":visible")) {
                                _transfer_degree.change();
                            } else if (select != _career_degree && _career_degree.is(":visible")) {
                                _career_degree.change();
                            } else if (_filter_key != select_val) {
                                _filter_key = select_val;
                                var _serchKey = _filter_key == 'HS' ? 'HS.' : _filter_key == 'VS' ? 'BACCE.' : _filter_key;
                                var _programs = null;
                                if (_serchKey) {
                                    _programs = getProgramsBySearchKey(_serchKey);
                                }
                                changeProgramsSelect(_programs);
                            }
                        }
                    }, 100);
                });
            }

            function getProgramsBySearchKey(_serchKey) {
                return _.filter(Drupal.settings.kcc_enrollform.acad_programs, function (row) {
                    return row.id.indexOf(_serchKey) != -1;
                });
            }

            function changeProgramsSelect(options) {
                var selected_val = _programs_select.val();

                clearProgramsSelect();
                if (options) {
                    $.each(options, function (i, option) {
                        _programs_select.append($('<option>', {
                            value: option.id,
                            text : option.title,
                            selected: option.id == selected_val
                        }));
                    });
                }
            }

            function clearProgramsSelect() {
                _programs_select.find('option').each(function(){
                    var _option = $(this);
                    if (_option.val()) {
                        _option.remove();
                    }
                });
            }

            function clearSelect(select) {
                select.find('option').each(function(){
                    var _option = $(this);
                    if (_option.val()) {
                        _option.remove();
                    }
                });
            }

            function reloadSelect(options, select) {
                var selected_val = select.val();

                clearSelect(select);
                if (options) {
                    $.each(options, function (i, option) {
                        select.append($('<option>', {
                            value: option.id,
                            text : option.title,
                            selected: option.id == selected_val
                        }));
                    });
                }
            }

            var form_pathname = window.location.pathname;
            var form_referrer = document.referrer;

            if (form_referrer.indexOf(form_pathname) == -1) {
                $.cookie('form_referrer', form_referrer);
            }

            if (window.history && window.history.pushState) {

                var step = form.find('[name*="page_num"]').val(),
                    hash_namespace = '#step-';

                window.history.pushState('forward', null, hash_namespace + step);

                $(window).on('popstate', function (e) {
                    var redirect;

                    if (step == 1) {
                        redirect = $.cookie('form_referrer');
                        if (redirect) {
                            window.location.href = redirect;
                        }
                    } else {
                        form.find('.form-actions .webform-previous.form-submit').click();
                    }
                });
            }
        }
    };
})(jQuery);