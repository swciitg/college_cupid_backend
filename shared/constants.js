exports.AdminList = [
	"r.hardik@iitg.ac.in", 
	"swc@iitg.ac.in", 
	"vineet.mech22@iitg.ac.in", 
	"venkatesh.m@iitg.ac.in",
];

exports.GuestUserInfo = {
	rollNumber: "200000000",
	displayName: "GUEST USER"
};

exports.GuestEmails = ["swc_app@iitg.ac.in"];

exports.deactivatedUserProfile = {
	name: "Deactivated User",
	gender: "MALE",
	email: "deactivatedUser@iitg.ac.in",
	rollNumber: "210102000",
	sexualOrientation: {
		type: "STRAIGHT",
		display: false,
	},
	relationshipGoals: {
		goal: "LONG TERM",
		display: false,
	},
	profilePicUrls: [
		{
			Url: "https://swc.iitg.ac.in/collegeCupid/api/v2/getImage?photoId=68d951a0-dd6a-4b38-81b8-ebf58009d1bd-compressed",
			blurHash: null,
		},
		{
			Url: "https://swc.iitg.ac.in/collegeCupid/api/v2/getImage?photoId=68d951a0-dd6a-4b38-81b8-ebf58009d1bd-compressed",
			blurHash: null,
		},
		{
			Url: "https://swc.iitg.ac.in/collegeCupid/api/v2/getImage?photoId=68d951a0-dd6a-4b38-81b8-ebf58009d1bd-compressed",
			blurHash: null,
		},
	],
	program: "BTECH",
	yearOfJoin: 24,
	interests: [],
	bio: " ",
	publicKey: " ",
	personalityType: "estj",
};

exports.ZODIAC_ENUM = [
      "ARIES",
      "TAURUS",
      "GEMINI",
      "CANCER",
      "LEO",
      "VIRGO",
      "LIBRA",
      "SCORPIO",
      "SAGITTARIUS",
      "CAPRICORN",
      "AQUARIUS",
      "PISCES"
    ];

exports.TYPE_OF_RELATIONSHIP_ENUM = [
      "LONG TERM" , 
      "SHORT TERM",
      "CASUAL" ,
      "NOT LOOOKING TO DATE",
      "CASUAL - OPEN TO LONG TERM"
    ];

exports.SEXUAL_ORIENTATIONS_ENUM = [
      "STRAIGHT" ,
      "BISEXUAL",
      "LESBIAN",
      "GAY",
      "OTHERS"
    ];


exports.CONFESSIONS_REPORTS_ENUM = [
		"SPAM",
		"VULGAR",
		"HARASSMENT",
		"HATE_SPEECH",
		"SEXUAL_CONTENT",
		"VIOLENCE",
		"FALSE_INFORMATION",
		"IMPERSONATION",
		"PRIVACY_VIOLATION",
		"SELF_HARM",
		"ILLEGAL_ACTIVITY",
		"SCAM",
		"BULLYING",
		"THREATENING",
		"OTHER"
	];

exports.CONFESSIONS_TYPE_ENUM = [
            "SPOTTED_IN_CAMPUS" , 
            "GOSSIP",
			""
        ]

exports.CONFESSIONS_REPORTS_THRESHOLD = 5;
