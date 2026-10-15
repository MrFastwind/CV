// CV rendering engine (requires jQuery + Handlebars, then data.js + templates.js)
//
// data.json layout:
//   - shared scalars/lists at top level (name, contacts, tech_skills, ...)
//   - "profiles": one entry per selectable CV version, each with:
//       label          -> tab label
//       role, about    -> scalar/paragraph copy for the profile
//       experiences    -> array of INDEXES into the shared "experiences" list
//       tech_skills,
//       programming    -> arrays of skill NAMES into the shared lists
//       side_skills    -> array of plain strings (used as-is)
//   Omitted per-profile keys fall back to the shared top-level values.

Handlebars.registerHelper("join", function (arr) {
  return (arr || []).join(", ");
});

// Shared skill entries + profile list of names -> resolved entries (profile order)
function resolveSkillsByName(shared, names) {
  if (!names) return shared;
  return names
    .map(function (name) {
      var found = (shared || []).filter(function (s) {
        return s.name === name;
      })[0];
      if (!found) console.warn("CV: unknown skill name '" + name + "'");
      return found;
    })
    .filter(Boolean);
}

// Shared experiences + profile list of indexes -> resolved entries (profile order)
function resolveExperiencesByIndex(shared, indexes) {
  if (!indexes) return shared;
  return indexes
    .map(function (i) {
      var entry = (shared || [])[i];
      if (entry === undefined) console.warn("CV: experience index out of range: " + i);
      return entry;
    })
    .filter(Boolean);
}

// Merge the shared data with one profile into a flat render context.
// Keys the profile does not override fall back to the shared values.
function buildProfileContext(data, profileKey) {
  var profile = data.profiles[profileKey] || {};
  return {
    name: data.name,
    contacts: data.contacts,
    education: data.education,
    certifications: data.certifications,
    role: profile.role !== undefined ? profile.role : data.role,
    about: profile.about !== undefined ? profile.about : data.about,
    tech_skills: resolveSkillsByName(data.tech_skills, profile.tech_skills),
    programming: resolveSkillsByName(data.programming, profile.programming),
    side_skills: profile.side_skills !== undefined ? profile.side_skills : data.side_skills,
    experiences: resolveExperiencesByIndex(data.experiences, profile.experiences)
  };
}

// Render the whole page from a single flat data object.
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
      // Empty first: renderCV() runs again on every profile switch
      $el.empty().append('<div class="smallText"></div>');
      $el.children(".smallText").html(output);
    } else {
      $el.html(output);
    }
  });
}

// Profile selector ---------------------------------------
// The tab keys are the profile keys; the URL hash uses dashes
// (#it-operator) while JSON uses underscores ("it_operator").
function profileKeyToHash(key) {
  return String(key).replace(/_/g, "-");
}

function hashToProfileKey(hash) {
  return String(hash).replace(/-/g, "_");
}

// Render the profile and keep tabs + URL hash in sync.
function selectProfile(data, profileKey) {
  if (!data.profiles[profileKey]) {
    console.warn("CV: unknown profile '" + profileKey + "'");
    return;
  }

  renderCV(buildProfileContext(data, profileKey));

  $(".profile-tab").each(function () {
    var active = $(this).attr("data-profile") === profileKey;
    $(this)
      .toggleClass("active", active)
      .attr("aria-selected", active ? "true" : "false");
  });

  var hash = profileKeyToHash(profileKey);
  if (window.location.hash.replace(/^#/, "") !== hash) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + hash);
    } else {
      window.location.hash = hash;
    }
  }
}

// Build the tab bar from data.profiles and render the initial profile.
function initProfileSelector(data) {
  var $bar = $(".profile-selector");
  var keys = data && data.profiles ? Object.keys(data.profiles) : [];

  if (!keys.length) {
    $bar.hide();
    return;
  }

  keys.forEach(function (key) {
    $("<button type='button' class='profile-tab' role='tab'></button>")
      .attr("data-profile", key)
      .text(data.profiles[key].label || key)
      .appendTo($bar);
  });

  $bar.on("click", ".profile-tab", function () {
    selectProfile(data, $(this).attr("data-profile"));
  });

  // Manual hash edits / back-forward
  $(window).on("hashchange", function () {
    var key = hashToProfileKey(window.location.hash.replace(/^#/, ""));
    if (data.profiles[key]) selectProfile(data, key);
  });

  var initial = hashToProfileKey(window.location.hash.replace(/^#/, ""));
  if (!data.profiles[initial]) initial = keys[0];
  selectProfile(data, initial);
}

$(function () {
  // Prefer data.json when served over HTTP; fall back to the inline CV_DATA
  // (data.js) when fetch is unavailable or blocked (e.g. file://).
  $.getJSON("data.json")
    .done(function (data) {
      initProfileSelector(data);
    })
    .fail(function () {
      console.warn("CV: could not load data.json, falling back to inline CV_DATA");
      if (typeof CV_DATA === "undefined" || !CV_DATA) {
        console.error("CV: no fallback data available");
        return;
      }
      initProfileSelector(CV_DATA);
    });
});
