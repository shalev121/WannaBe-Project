window.WB_STATE = {
  // We leave this empty because Screen 1 will now get roles from the HTML (via app.py)
  roles: [],

  // Initial placeholders
  input: {
    currentRole: "",
    targetRole: ""
  },

  // This will be replaced by result.path from the API
  path: [],

  steps: [],

  selectedSkill: null
};