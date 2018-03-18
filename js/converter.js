Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(),0,1);
    var jul = new Date(this.getFullYear(),6,1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
Date.prototype.printLocalTimezone = function() {
    if (typeof moment !== "undefined") {
        var md = moment(this);
        return "GMT" + md.format("Z");
    }
    return '';
}
Date.prototype.epochConverterLocaleString = function(disabletz) {
    disabletz = disabletz || false;
    var locale = window.navigator.userLanguage || window.navigator.language;
    if (typeof moment === "undefined") {
        return this.toDateString() + " " + this.toTimeString();
    }
    moment.locale(locale);
    var md = moment(this);
    if (!md.isValid()) {
        return 'Invalid input.';
    }
    var currentLocaleData = moment.localeData();
    var myLocaleData = moment.localeData(locale);
    var myFormat = myLocaleData.longDateFormat('LLLL');
    if (md.format("SSS") != '000') {
        myFormat = myFormat.replace(":mm", ":mm:ss.SSS");
        myFormat = myFormat.replace(".mm", ".mm.ss.SSS");
    } else {
        myFormat = myFormat.replace(":mm", ":mm:ss");
        myFormat = myFormat.replace(".mm", ".mm.ss");
    }
    if (!disabletz) {
        myFormat += " [GMT]Z";
    }
    var customDate = md.format(myFormat);
    return customDate;
}
Date.prototype.epochConverterGMTString = function() {
    var locale = window.navigator.userLanguage || window.navigator.language;
    if (typeof moment === "undefined") {
        return this.toUTCString();
    }
    moment.locale('en');
    var md = moment(this);
    if (!md.isValid()) {
        return 'Invalid input.';
    }
    var myLocaleData = moment.localeData(locale);
    var myFormat = myLocaleData.longDateFormat('LLLL');
    if (md.format("SSS") != '000') {
        myFormat = myFormat.replace(":mm", ":mm:ss.SSS");
    } else {
        myFormat = myFormat.replace(":mm", ":mm:ss");
    }
    return md.utc().format(myFormat);
}
function EpochToHuman() {
    var inputtext = $('#ecinput').val();
    inputtext = inputtext.replace(/\s+/g, '');
    if (inputtext.charAt(inputtext.length - 1) == "L") {
        inputtext = inputtext.slice(0, -1);
    }
    var hr = "<hr class=\"lefthr\">";
    var errormessage = "Sorry, I can't parse this date.<br/>Check your timestamp, strip letters and punctuation marks.";
    var outputtext = "";
    if ((inputtext.length === 0) || isNaN(inputtext)) {
        if (isHex(inputtext)) {
            inputtext = '0x' + inputtext;
        } else {
            $('#result1').html(errormessage + hr);
            return;
        }
    }
    if (inputtext.substring(0, 2) == '0x') {
        outputtext += 'Converting <a href="/hex?q=' + inputtext.substring(2) + '">hexadecimal timestamp</a> to decimal: ' + parseInt(inputtext) + '<br/>';
    }
    inputtext = inputtext * 1;
    var epoch = inputtext;
    var extraInfo = 0;
    var rest = 0;
    if ((inputtext >= 100000000000000) || (inputtext <= -100000000000000)) {
        outputtext += "<b>Assuming that this timestamp is in microseconds (1/1,000,000 second):</b><br/>";
        epoch = Math.round(inputtext / 1000000);
        inputtext = Math.round(inputtext / 1000);
    } else if ((inputtext >= 100000000000) || (inputtext <= -100000000000)) {
        outputtext += "<b>Assuming that this timestamp is in milliseconds:</b><br/>";
        epoch = Math.floor(inputtext / 1000);
        rest = inputtext - (epoch * 1000);
    } else {
        if (inputtext < -6857222400) {
            outputtext += "<b>Dates before 14 september 1752 (pre-Gregorian calendar) are not accurate:</b><br/>";
        }
        if (inputtext > 10000000000)
            extraInfo = 1;
        inputtext = (inputtext * 1000);
    }
    var datum = new Date(inputtext);
    debugger;
    if (isValidDate(datum)) {
        var convertedDate = datum.epochConverterGMTString();
        outputtext += "<b>GMT</b>: " + convertedDate;
        outputtext += "<br/><b>Your time zone</b>: <span title=\"" + datum.toDateString() + " " + datum.toTimeString() + "\">" + datum.epochConverterLocaleString(1) + "</span>";
        if (typeof moment !== "undefined") {
            outputtext += " <a title=\"convert to other time zones\" href=\"https://www.epochconverter.com/timezones?q=" + epoch + "\">" + datum.printLocalTimezone() + "</a>";
            var md = moment(datum);
            if (md.isDST()) {
                outputtext += ' <span class="help" title="daylight saving/summer time">DST</span>';
                if (datum.getFullYear() < 1908)
                    outputtext += '<br/><br/>Please note:<br/>DST (Daylight Saving Time) was first used around 1908. JavaScript uses the current DST rules for all dates in history. ';
            }
        }
        if (extraInfo)
            outputtext += "<br/>This conversion uses your timestamp in seconds. Remove the last 3 digits if you are trying to convert milliseconds.";
    } else {
        outputtext += errormessage;
    }
    $('#result1').html(outputtext + hr);
}
function HumanToEpochTZ() {
    var tz = $('#hf select[name=tz]').val();
    var datum;
    var preflink = '<br/>If you prefer another date format, set your <a href="/site/preferences">preferences</a>.';
    var a = $('#result2');
    var mm = $('#hf [name=mm]').val();
    var dd = $('#hf input[name=dd]').val();
    var hh = $('#hf input[name=hh]').val();
    var mn = $('#hf input[name=mn]').val();
    var ss = $('#hf input[name=ss]').val();
    var yyyy = $('#hf input[name=yyyy]').val();
    var warning = '<b>Please check your input.</b><br/>';
    if (yyyy.length === 0 || isNaN(yyyy)) {
        a.html(warning + "Invalid year.");
        return;
    }
    if (mm.length === 0 || isNaN(mm) || mm > 12) {
        a.html(warning + 'Invalid month.' + preflink);
        return;
    }
    if (dd.length === 0 || dd > 31) {
        a.html(warning + 'Invalid day.');
        return;
    }
    if (hh.length === 0 || hh > 23) {
        a.html(warning + 'Invalid hour.');
        return;
    }
    if (mn.length === 0 || mn > 59) {
        a.html(warning + 'Invalid minute.');
        return;
    }
    if (ss.lenght === 0 || ss > 59) {
        a.html(warning + 'Invalid second.');
        return;
    }
    var usedGMT = 0;
    if (tz == 2) {
        datum = new Date(yyyy,mm - 1,dd,hh,mn,ss);
    } else {
        datum = new Date(Date.UTC(yyyy, mm - 1, dd, hh, mn, ss));
        usedGMT = 1;
    }
    var resulttext = "<b>Epoch timestamp</b>: " + (datum.getTime() / 1000.0);
    resulttext += "<br/><span title='Used in Java, JavaScript'>Timestamp in milliseconds: " + datum.getTime() + "</span>";
    resulttext += "<br/>" + (usedGMT ? '<b>' : '') + "Human time (GMT)" + (usedGMT ? '</b>' : '') + ":  " + datum.epochConverterGMTString();
    resulttext += "<br/>" + (usedGMT ? '' : '<b>') + "Human time (your time zone)" + (usedGMT ? '' : '</b>') + ": " + datum.epochConverterLocaleString();
    $('#result2').html(resulttext);
}

function homepageStart() {
    if ($("#tsclock").length != 0) {
        var clockActive = 1;
        $("#tsclock").mouseover(function() {
            clockActive = 0;
            $("#clocknotice").html('<i class="fa fa-pause" aria-hidden="true"></i>').show();
            setTimeout(resetClockNotice, 1000);
        });
        $("#tsclock").mouseout(function() {
            clockActive = 1;
            $("#clocknotice").html('');
        });
        setInterval(function() {
            if (clockActive) {
                var epoch = Math.round(new Date().getTime() / 1000.0);
                $("#tsclock").html(epoch);
            }
        }, 1000);
    }
    var today = new Date();
    $('#ecinput').val(Math.round(today.getTime() / 1000.0));
    if (preferredtz == 2) {
        $('select[name=mm],input:text[name=mm]').val(today.getMonth() + 1);
        $('input:text[name=yyyy]').val(today.getFullYear());
        $('input:text[name=dd]').val(today.getDate());
        $('input:text[name=hh]').val(today.getHours());
        $('input:text[name=mn]').val(today.getMinutes());
    } else {
        $('select[name=mm],input:text[name=mm]').val(today.getUTCMonth() + 1);
        $('input:text[name=yyyy]').val(today.getUTCFullYear());
        $('input:text[name=dd]').val(today.getUTCDate());
        $('input:text[name=hh]').val(today.getUTCHours());
        $('input:text[name=mn]').val(today.getUTCMinutes());
    }
    $('input:text[name=ss]').val(today.getUTCSeconds());
    $('#fs input:text[name=DateTime]').val(today.toUTCString());
    $(document).keypress(function(e) {
        if (!$(e.target).is('input#ecinput, input#rcinput')) {
            if (!(e.ctrlKey || e.altKey || e.metaKey)) {
                if (String.fromCharCode(e.which).match(/[a-zA-Z]/))
                    e.preventDefault();
                switch (e.which) {
                case 101:
                case 69:
                    kp('ecinput');
                    jumpTo('top');
                    break;
                case 99:
                case 67:
                    emptyFields();
                    break;
                case 104:
                case 72:
                    kp('hcinput');
                    jumpTo('top');
                    break;
                case 114:
                case 82:
                    kp('rcinput');
                    jumpTo('fs');
                    break;
                case 115:
                case 83:
                    kp('scinput');
                    jumpTo('tchead');
                    break;
                case 121:
                case 89:
                    $('input:radio[name=cw]:nth(0)').attr('checked', true);
                    updateBe('year');
                    jumpTo('brhead');
                    kp('ycinput');
                    break;
                case 109:
                case 77:
                    $('input:radio[name=cw]:nth(1)').attr('checked', true);
                    updateBe('month');
                    jumpTo('brhead');
                    if (dateformat == "3") {
                        kp('ycinput');
                    } else {
                        kp('mcinput');
                    }
                    break;
                case 100:
                case 68:
                    $('input:radio[name=cw]:nth(2)').attr('checked', true);
                    updateBe('day');
                    jumpTo('brhead');
                    if (dateformat == "2") {
                        kp('dcinput');
                    } else if (dateformat == "3") {
                        kp('ycinput');
                    } else {
                        kp('mcinput');
                    }
                    break;
                }
            }
        }
    });
}
function resetClockNotice() {
    $("#clocknotice").hide();
}
function timezoneStart() {
    $(document).keypress(function(e) {
        if (!(e.ctrlKey || e.altKey || e.metaKey)) {
            if (String.fromCharCode(e.which).match(/[a-zA-Z]/))
                e.preventDefault();
            switch (e.which) {
            case 101:
            case 69:
                kp('ecinput');
                jumpTo('top');
                break;
            }
        }
    });
}
function jumpTo(toid) {
    var new_position = $('#' + toid).offset();
    window.scrollTo(new_position.left, new_position.top);
}
function emptyFields() {
    $('input:text').val("");
    $(".resultbox").fadeOut('', function() {
        $(".resultbox").html('').show();
    });
}
function kp(id) {
    $('#' + id).focus();
    $('#' + id).select();
}
function isValidDate(d) {
    if (Object.prototype.toString.call(d) !== "[object Date]")
        return false;
    return !isNaN(d.getTime());
}
function isHex(h) {
    var a = parseInt(h, 16);
    return (a.toString(16) === h.toLowerCase())
}
function Ax() {
    var d = $(location).attr('hostname');
    if ((d.search(/sja/i) > 0) || (d.search(/hcon/i) > 3) || d.search(/ogl/i) > 0) {
        return 1;
    } else {
        return 0;
    }
}
function UpdateTableHeaders() {
    $(".persist-area").each(function() {
        var el = $(this)
          , offset = el.offset()
          , scrollTop = $(window).scrollTop()
          , floatingHeader = $(".floatingHeader", this)
        if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
            floatingHeader.css({
                "visibility": "visible"
            });
        } else {
            floatingHeader.css({
                "visibility": "hidden"
            });
        }
        ;
    });
}