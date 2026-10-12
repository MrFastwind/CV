// Handlebars templates. Each partial receives the raw array from CV_DATA[key]
// and iterates with {{#each this}}. Class structure/nesting matches the
// original static HTML so the existing CSS applies unchanged.

// Contact type -> FontAwesome icon class
Handlebars.registerHelper("icon", function (type) {
  var icons = {
    email: "fa-envelope",
    phone: "fa-phone",
    location: "fa-map-marker",
    linkedin: "fa-linkedin-square"
  };
  return icons[type] || "fa-circle";
});

// Contact type + value -> href (null means "no link")
Handlebars.registerHelper("href", function (type, value) {
  if (type === "email") return "mailto:" + value;
  if (type === "linkedin") return "https://www.linkedin.com/" + value;
  return null;
});

// Contact list ------------------------------------------
Handlebars.registerPartial(
  "contacts",
  '{{#each this}}' +
    '<p>' +
    '<i class="fa {{icon type}} contactIcon" aria-hidden="true"></i>' +
    '{{#if (href type value)}}<a href="{{href type value}}">{{value}}</a>{{else}}{{value}}{{/if}}' +
    '</p>' +
    '{{/each}}'
);

// About paragraphs (renders HTML tags - triple-stash is intentional)
Handlebars.registerPartial(
  "about",
  '{{#each this}}<p>{{{this}}}</p>{{/each}}'
);

// Skill list (tech_skills / programming) ----------------
Handlebars.registerPartial(
  "skillList",
  '{{#each this}}' +
    '<div class="skill">' +
    '<div><span>{{name}}</span></div>' +
    '<div class="yearsOfExperience"><span>{{years}}</span></div>' +
    '</div>' +
    '{{/each}}'
);

// Side skills (plain <p> list) --------------------------
Handlebars.registerPartial(
  "sideSkills",
  '{{#each this}}<p>{{this}}</p>{{/each}}'
);

// Education ----------------------------------------------
Handlebars.registerPartial(
  "education",
  '{{#each this}}' +
    '<div class="smallText sub-item">' +
    '<p class="bolded white">{{title}}</p>' +
    '<p>{{institution}}</p>' +
    '<p>{{period}}</p>' +
    '</div>' +
    '{{/each}}'
);

// Experiences --------------------------------------------
Handlebars.registerPartial(
  "experiences",
  '{{#each this}}' +
    '<li>' +
    '<div class="jobPosition">' +
    '<span class="bolded">{{position}}</span>' +
    '<span>{{period}}</span>' +
    '</div>' +
    '<div class="projectName bolded"><span>{{company}}</span></div>' +
    '<div class="smallText">' +
    '<p>{{description}}</p>' +
    '<ul>{{#each points}}<li>{{this}}</li>{{/each}}</ul>' +
    '<p><span class="bolded">Skills:</span> {{join skills}}</p>' +
    '</div>' +
    '</li>' +
    '{{/each}}'
);

// Certifications ----------------------------------------
Handlebars.registerPartial(
  "certifications",
  '{{#each this}}' +
    '<li>' +
    '<div class="jobPosition">' +
    '<span class="bolded">{{title}}</span>' +
    '<span>{{date}}</span>' +
    '</div>' +
    '<div class="projectName bolded"><span>{{institution}}</span></div>' +
    '<div class="smallText">' +
    '<p>{{description}}</p>' +
    '<ul>{{#each points}}<li>{{this}}</li>{{/each}}</ul>' +
    '</div>' +
    '</li>' +
    '{{/each}}'
);
