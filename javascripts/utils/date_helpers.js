// forrás: http://blog.dansnetwork.com/2008/11/01/javascript-iso8601rfc3339-date-parser/
// kis módosítással
Date.prototype.setISO8601 = function(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))?/;

    if (dString.toString().match(new RegExp(regexp))) {
        var d = dString.match(new RegExp(regexp));
        var offset = 0;
        this.setUTCDate(1);
        this.setUTCFullYear(parseInt(d[1],10));
        this.setUTCMonth(parseInt(d[3],10) - 1);
        this.setUTCDate(parseInt(d[5],10));
        this.setUTCHours(parseInt(d[7],10));
        this.setUTCMinutes(parseInt(d[9],10));
        this.setUTCSeconds(parseInt(d[11],10));
        if (d[12])
            this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            this.setUTCMilliseconds(0);
        if (d[13] && d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17],10);
            offset *= ((d[14] == '-') ? -1 : 1);
            this.setTime(this.getTime() - offset * 60 * 1000);
        }
    }
    else {
        this.setTime(Date.parse(dString));
    }
    return this;
};

var DateHelper = {
    // Takes the format of "Jan 15, 2007 15:45:00 GMT" and converts it to a relative time
    // Ruby strftime: %b %d, %Y %H:%M:%S GMT
    time_ago_in_words_with_parsing: function(from) {
        var date = new Date;
        date.setTime(Date.parse(from));
        return this.time_ago_in_words(date);
    },

    time_ago_in_words: function(from) {
        return this.distance_of_time_in_words(new Date, from);
    },

    distance_of_time_in_words: function(to, from) {
        var distance_in_seconds = ((to - from) / 1000);
        var distance_in_minutes = Math.floor((distance_in_seconds / 60));

        if (distance_in_minutes == 0) { return 'kevesebb, mint egy perce'; }
        if (distance_in_minutes == 1) { return 'egy perce'; }
        if (distance_in_minutes < 45) { return distance_in_minutes + ' perce'; }
        if (distance_in_minutes < 90) { return ' kb. 1 órája'; }
        if (distance_in_minutes < 1440) { return 'kb. ' + Math.floor(distance_in_minutes / 60) + ' órája'; }
        if (distance_in_minutes < 2880) { return '1 napja'; }
        if (distance_in_minutes < 43200) { return Math.floor(distance_in_minutes / 1440) + ' napja'; }
        if (distance_in_minutes < 86400) { return 'kb. 1 hónapja'; }
        if (distance_in_minutes < 525960) { return Math.floor(distance_in_minutes / 43200) + ' hónapja'; }
        if (distance_in_minutes < 1051199) { return 'kb. 1 éve'; }

        return 'több, mint ' + Math.floor(distance_in_minutes / 525960) + ' 1 éve';
    },
};
