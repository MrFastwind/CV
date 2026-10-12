// CV rendering engine (requires jQuery + Handlebars, then data.js + templates.js)

Handlebars.registerHelper("join", function (arr) {
  return (arr || []).join(", ");
});

// Render the whole page from a single data object.
function renderCV(data) {
  // Mount points for single scalar fields, e.g. <h1 data-field="name"></h1>
  $("[data-field]").each(function () {
    var $el = $(this);
    var value = data[$el.data("field")];
    if (value !== undefined) $el.text(value);
  });

  // List mount points:
  //   data-partial="contacts"      -> partial to render
  //   data-key="contacts"          -> data[key] passed as context
  //   data-tag="smallText" ("")    -> optional wrapper class around the list
  $("[data-partial]").each(function () {
    var $el = $(this);
    var partial = $el.data("partial");
    var key = $el.data("key") || partial;
    var context = data[key];

    if (context === undefined) {
      console.warn("CV: no data for key '" + key + "'");
      return;
    }

    var template = Handlebars.compile(Handlebars.partials[partial]);
    var output = template(context);

    if ($el.data("tag")) {
      $el.append('<div class="smallText"></div>');
      $el.children(".smallText").html(output);
    } else {
      $el.html(output);
    }
  });
}

$(function () {
  // Prefer data.json when served over HTTP; fall back to the inline CV_DATA
  // (data.js) when fetch is unavailable or blocked (e.g. file://).
  $.getJSON("data.json")
    .done(function (data) {
      renderCV(data);
    })
    .fail(function () {
      console.warn("CV: could not load data.json, falling back to inline CV_DATA");
      renderCV(CV_DATA);
    });
});
