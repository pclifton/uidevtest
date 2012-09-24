jQuery.extend({
    CMGdispatch: function(){
        var dispatcher = new CMGdispatcher();
    }
});

CMGformatDate = function(field, render) {
    var date = new Date(render(field)).toString('h:mm tt dddd, MMM. d, yyyy');
    // Kind of hacky fix for AM/PM
    date = date.replace('AM', 'a.m.').replace('PM', 'p.m.');
    return date;
}

var CMGdispatcher = function() {
    this.dispatch();
}

// Dispatch the request
CMGdispatcher.prototype.dispatch = function() {
    var story = this.getParam('story');
    if (typeof(story) !== 'undefined') {    // conditional for story view
        this.renderStoryView(story);
    } else {
        // Default view is story list
        this.renderStoryList();
    }
}

// Parse URL params into a hash
CMGdispatcher.prototype.getParams = function() {
    if (typeof(this.params) === 'undefined') {
        var paramString = window.location.search;
        // Die, question mark, die!
        paramString = paramString.substr(1);
        var params = {};
        $.each(paramString.split('&'), function(){
            var parts = this.split('=');
            params[parts[0]] = parts[1];
        });
        this.params = params;
    }
    
    return this.params;
}

// Get a URL param
CMGdispatcher.prototype.getParam = function(key) {
    return this.getParams()[key];
}

// Render the story list
CMGdispatcher.prototype.renderStoryList = function() {
    // Render story list
    $.getJSON('../js/uidevtest-data.js', function(data){
        // Tweak data to provide a date lambda function and story key
        $.each(data.objects, function(k, v){
            data.objects[k].date_format = function() {
                return function(field, render) {
                    return CMGformatDate(field, render);
                }
            }
            /**
             * Hard-coding the leading zero here isn't that great, but in all honesty, that
             * leading zero would be pointless in the real world and I wouldn't include it at all
             */
            data.objects[k].story_key = 'sto0' + (k + 1);
        });
        var html = Mustache.to_html(templates.storyList, data);
        $('body').append(html);
    });
}

// Render story view
CMGdispatcher.prototype.renderStoryView = function(story) {
    $.getJSON('../js/uidevtest-data.js', function(data){
        // Get story key
        var storyKey = Number(story.replace('sto0', '')) - 1;
        var datum = data.objects[storyKey];
        // Add data lambda function
        datum.date_format = function() {
            return function(field, render) {
                return CMGformatDate(field, render);
            }
        }
        // Join lambda. I'm looking at you, authors
        datum.join = function() {
            return function(field, render) {
                return this[field].join(', ');
            }
        }
        var html = Mustache.to_html(templates.storyView, datum);
        $('body').append(html);
    });
}