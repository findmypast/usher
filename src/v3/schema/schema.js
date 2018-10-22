module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "action_iterator": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "do": { "type": "string", "pattern": "^for$" },
        "each": { "type": "string" },
        "in": { "type": "string", "pattern": "<%=[^%]+%>" },
        "exec": { "type": "string" },
        "when": { "type": "string" },
        "options": { "$ref": "#/definitions/action_options" }
      },
      "required": ["do", "each", "in", "exec"]
    },
    "action_options": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "ignore_error": { "type": "boolean" },
        "on_error": { "type": "string" },
        "on_exit": { "type": "string" },
        "register": { "type": "string" },
        "retry": { "$ref": "#/definitions/action_options_retry" },
        "shell": { "$ref": "#/definitions/action_options_shell" }
      }
    },
    "action_options_retry": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "factor": { "type": "number" },
        "maxTimeout": { "type": "integer" },
        "minTimeout": { "type": "integer" },
        "randomize": { "type": "boolean" },
        "retries": { "type": "integer" }
      }
    },
    "action_options_shell": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "cwd": { "type": "string" },
        "env": { "type": "object" },
        "encoding": { "type": "string" },
        "guid": { "type": "integer" },
        "killSignal": { "type": ["integer", "string"] },
        "maxBuffer": { "type": "integer" },
        "shell": { "type": ["boolean", "string"] },
        "timeout": { "type": "integer" },
        "uid": { "type": "integer" }
      }
    },
    "action_shell": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "do": { "type": "string", "pattern": "^shell$" },
        "command": { "type": "string" },
        "when": { "type": "string" },
        "options": { "$ref": "#/definitions/action_options" }
      },
      "required": ["do", "command"]
    },
    "action_task": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "do": { "type": "string", pattern: '^(?!.*(shell|for)).*$' },
        "when": { "type": "string" },
        "options": { "$ref": "#/definitions/action_options" }
      },
      "required": ["do"]
    },
    "include": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "from": { "type": "string" },
        "import": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["from"]
    },
    "param": {
      "type": ["object", "string"],
      "additionalProperties": false,
      "properties": {
        "default": {},
        "description": { "type": "string" },
        "required": { "type": "boolean" }
      },
      "required": ["default", "description", "required"]
    },
    "task": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "description": { "type": "string" },
        "parallel": { "type": "boolean" },
        "params": { "type": "array", "items": { "type": "string" } },
        "outputs": { "type": "array", "items": { "type": "string" } },
        "on_error": { "type": "string" },
        "on_exit": { "type": "string" },
        "when": { "type": "string" },
        "actions": {
          "type": "array",
          "items": {
            "anyOf": [
              { "$ref": "#/definitions/action_iterator" },
              { "$ref": "#/definitions/action_shell" },
              { "$ref": "#/definitions/action_task" }
            ]
          },
          "minItems": 1
        }
      },
      "required": ["actions"]
    }
  },
  "properties": {
    "version": { "type": "string", "pattern": "^3$" },
    "vars": { "type": "object", "minProperties": 1, "properties": {} },
    "includes": {
      "type": "object",
      "minProperties": 1,
      "properties": {},
      "patternProperties": { ".+": { "$ref": "#/definitions/include" } }
    },
    "params": {
      "type": "object",
      "minProperties": 1,
      "properties": {},
      "patternProperties": { ".+": { "$ref": "#/definitions/param" } }
    },
    "tasks": {
      "type": "object",
      "minProperties": 1,
      "properties": {},
      "patternProperties": { ".+": { "$ref": "#/definitions/task" } }
    }
  },
  "required": ["tasks", "version"],
  "title": "Usher V3 Usher File Schema",
  "type": "object"
};
