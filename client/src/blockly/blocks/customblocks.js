import * as Blockly from "blockly/core"

Blockly.Solidity = new Blockly.Generator("Solidity")

Blockly.Solidity.LABEL_GROUP_STATE = "state"
Blockly.Solidity.LABEL_GROUP_PARAMETER = "parameter"
Blockly.Solidity.LABEL_GROUP_VARIABLE = "variable"
Blockly.Solidity.LABEL_GROUP_FUNCTION = "function"
Blockly.Solidity.UNDEFINED_NAME = "__UNDEFINED__"
Blockly.Solidity.LABEL_GROUP_MAP = "map"
Blockly.Solidity.LABEL_GROUP_NMAP = "nmap"
Blockly.Solidity.LABEL_GROUP_EVENT = "event"
Blockly.Solidity.LABEL_GROUP_MODIFIER = "modifier"

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Solidity.addReservedWords(
    "Blockly," + // In case JS is evaled in the current window.
        "abstract, after, case, catch, default, final, in, inline, let, match," +
        "null, of, relocatable, static, switch, try, type, typeof"
    // TODO: Fix with reference to:
    // https://solidity.readthedocs.io/en/develop/miscellaneous.html
    // http://solidity.readthedocs.io/en/latest/units-and-global-variables.html
)

Blockly.Extensions.register("declare_typed_variable", function () {
    var block = this

    if (!this.getVariableNameField) {
        throw "missing getVariableNameField function"
    }

    if (!this.getVariableType) {
        throw "missing getVariableType function"
    }

    if (!this.getVariableGroup) {
        throw "missing getVariableGroup function"
    }

    if (!this.getVariableScope) {
        throw "missing getVariableScope function"
    }

    this.declareOrUpdateVariable = function (name, force = false) {
        var oldName = this.getVariableNameField().getValue()

        if (!this.getParent()) {
            return oldName
        }

        if (!force && (!this.getParent() || oldName == name)) {
            return oldName
        }

        var group = this.getVariableGroup()
        var scope = this.getVariableScope()
        var type = this.getVariableType()

        if (!Blockly.Solidity.getVariableByNameAndScope(name, scope, group)) {
            newName = name
        } else {
            var count = 2
            var newName = name + count
            while (Blockly.Solidity.getVariableByNameAndScope(newName, scope, group)) {
                count++
                newName = name + count
            }
        }

        var variable = Blockly.Solidity.getVariableById(this.workspace, this.id)
        if (!variable) {
            Blockly.Solidity.createVariable(this.workspace, group, type, newName, scope, this.id)
        } else {
            variable.name = newName
        }

        if (force) {
            this.getVariableNameField().setValue(newName)
        }

        Blockly.Solidity.updateWorkspaceNameFields(this.workspace)

        return newName
    }

    this.getVariableNameField().setValidator(function (name) {
        return block.declareOrUpdateVariable(name)
    })

    var onchange = null

    this.setOnChange(function (event) {
        Blockly.Solidity.updateWorkspaceNameFields(this.workspace)
        Blockly.Solidity.updateWorkspaceStateTypes(this.workspace)
        Blockly.Solidity.updateWorkspaceParameterTypes(this.workspace)

        if (event.blockId != this.id) {
            return
        }

        if (event.type == "move" && !!event.oldParentId) {
            if (!!Blockly.Solidity.getVariableById(this.workspace, this.id)) {
                this.workspace.deleteVariableById(this.id)
            }
        }
        if (event.type == "move" && !!event.newParentId) {
            if (!this.workspace.getVariableById(this.id)) {
                this.declareOrUpdateVariable(this.getVariableNameField().getValue(), true)
            }
        }
        if (event.element == "field" && event.name == "TYPE") {
            var variable = this.workspace.getVariableById(this.id)

            variable.type = this.getVariableType()
            Blockly.Solidity.updateWorkspaceStateTypes(this.workspace)
        }

        if (!!onchange) {
            onchange.call(block, event)
        }
    })
})

Blockly.Solidity.updateWorkspaceNameFields = function (workspace) {
    var blocks = workspace.getAllBlocks()
    for (var i = 0; i < blocks.length; ++i) {
        var nameField = blocks[i].getVariableNameSelectField
            ? blocks[i].getVariableNameSelectField()
            : null
        var group = blocks[i].getVariableLabelGroup ? blocks[i].getVariableLabelGroup() : null

        if (!!nameField && !!group) {
            var vars = Blockly.Solidity.getVariablesInScope(blocks[i], group)
            var options = vars.map(function (v) {
                return [Blockly.Solidity.getVariableName(v), v.id_]
            })

            var selectedOption = nameField.getValue()

            console.log("selected option => ", selectedOption)
            if (options.length != 0) {
                var wasUndefined = nameField.menuGenerator_[0][1] == Blockly.Solidity.UNDEFINED_NAME

                nameField.menuGenerator_ = options
                if (wasUndefined) {
                    nameField.setValue(options[0][1])
                } else {
                    nameField.setValue(selectedOption)
                }
            }
        }
    }
}

Blockly.Solidity.updateWorkspaceTypes = function (workspace, nameFieldName, valueFieldName) {
    var blocks = workspace.getAllBlocks()
    var vars = workspace.getAllVariables()

    for (var i = 0; i < blocks.length; ++i) {
        var stateNameField = blocks[i].getField(nameFieldName)

        if (!stateNameField) {
            continue
        }

        var variableId = blocks[i].getFieldValue(nameFieldName)
        var variable = workspace.getVariableById(variableId)

        if (!variable) {
            return
        }

        if (blocks[i].inputList[0] && blocks[i].inputList[0].name == valueFieldName) {
            switch (variable.type) {
                case "TYPE_BOOL":
                    blocks[i].inputList[0].setCheck("Boolean")
                    break
                case "TYPE_INT":
                    blocks[i].inputList[0].setCheck("Number")
                    break
                case "TYPE_UINT":
                    blocks[i].inputList[0].setCheck("Number")
                    break
                default:
            }
        }
    }
}

Blockly.Solidity.updateWorkspaceStateTypes = function (workspace) {
    Blockly.Solidity.updateWorkspaceTypes(workspace, "STATE_NAME", "STATE_VALUE")
}

Blockly.Solidity.updateWorkspaceParameterTypes = function (workspace) {
    Blockly.Solidity.updateWorkspaceTypes(workspace, "PARAM_NAME", "PARAM_VALUE")
}

Blockly.Solidity.createVariable = function (workspace, group, type, name, scope, id) {
    var variable = workspace.createVariable(name, type, id)

    variable.group = group
    variable.scope = scope

    Blockly.Solidity.setVariableName(variable, name)

    return variable
}

Blockly.Solidity.getVariableById = function (workspace, id) {
    return workspace.getVariableById(id)
}

Blockly.Solidity.getVariableByName = function (workspace, name) {
    return Blockly.Solidity.getAllVariables(workspace).filter(function (v) {
        return Blockly.Solidity.getVariableName(v) == name
    })[0]
}

Blockly.Solidity.getVariableByNameAndScope = function (name, scope, group = null) {
    return Blockly.Solidity.getVariablesInScope(scope, group).filter(function (v) {
        return Blockly.Solidity.getVariableName(v) == name
    })[0]
}

Blockly.Solidity.deleteVariableById = function (workspace, id) {
    Blockly.Solidity.deleteVariableByName(
        workspace,
        Blockly.Solidity.getVariableById(workspace, id).name
    )
}

Blockly.Solidity.deleteVariableByName = function (workspace, name) {
    return workspace.deleteVariable(name)
}

Blockly.Solidity.variableIsInScope = function (variable, scope) {
    while (!!scope && scope.id != variable.scope.id) {
        var type = scope.type
        do {
            scope = scope.getParent()
        } while (scope && type == scope.type)
    }

    return !!scope
}

Blockly.Solidity.setVariableName = function (variable, name) {
    variable.name = '_scope("' + variable.scope.id + '")_' + name
}

Blockly.Solidity.getVariableName = function (variable) {
    return variable.name.replace('_scope("' + variable.scope.id + '")_', "")
}

Blockly.Solidity.getAllVariables = function (workspace) {
    return workspace.getAllVariables()
}

Blockly.Solidity.getVariablesInScope = function (block, group = null) {
    return Blockly.Solidity.getAllVariables(block.workspace)
        .filter(function (v) {
            return Blockly.Solidity.variableIsInScope(v, block)
        })
        .filter(function (v) {
            return !group || v.group == group
        })
}

Blockly.defineBlocksWithJsonArray([
    {
        type: "contract",
        message0: "license %1",
        args0: [
            {
                type: "field_dropdown",
                name: "LICENSE",
                options: [
                    ["MIT", "MIT"],
                    ["Apache 1.0", "Apache-1.0"],
                    ["Apache 1.1", "Apache-1.1"],
                    ["Apache 2.0", "Apache-2.0"],
                    ["BSD 2 Clause", "BSD-2-Clause"],
                    ["BSD 3 Clause", "BSD-3-Clause"],
                    ["CDDL 1.1", "CDDL-1.1"],
                    ["EPL 2.0", "EPL-2.0"],
                    ["GPL 1.0 or later", "GPL-1.0-or-later"],
                    ["LGPL 2.0 or later", "LGPL-2.0-or-later"],
                    ["MPL 2.0", "MPL-2.0"],
                ],
            },
        ],
        message1: "pragma version %1",
        args1: [
            {
                type: "field_input",
                name: "PRAGMA",
                check: ["string", "number"],
                text: "0.8.17",
            },
        ],
        message2: "import %1",
        args2: [
            {
                type: "input_statement",
                name: "IMPORT",
                check: ["import"],
                align: "RIGHT",
            },
        ],
        message3: "smart contract %1 %2",
        args3: [
            {
                type: "field_input",
                name: "NAME",
                check: "String",
                text: "MyContract",
            },
            {
                type: "input_value",
                name: "INHERIT",
                check: "String",
            },
        ],
        message4: "states %1",
        args4: [
            {
                type: "input_statement",
                name: "STATES",
                check: ["contract_state"],
                align: "RIGHT",
            },
        ],
        message5: "constructor %1",
        args5: [
            {
                type: "input_statement",
                name: "CTOR",
                check: ["contract_ctor"],
                align: "RIGHT",
            },
        ],
        message6: "modifiers %1",
        args6: [
            {
                type: "input_statement",
                name: "MODIFIERS",
                check: ["modifier"],
                align: "RIGHT",
            },
        ],
        message7: "functions %1",
        args7: [
            {
                type: "input_statement",
                name: "FUNCTIONS",
                check: ["contract_function"],
                align: "RIGHT",
            },
        ],
        colour: 160,
        tooltip: "Declares a new smart contract.",
    },
])

// Contract States Variables
const TOOLTIPS_BY_STATE = {
    "select type":
        "State variables are variables whose values are permanently stored in contract storage",
    bytes: "The value types bytes1, bytes2, bytes3, …, bytes32 hold a sequence of bytes from one to up to 32.",
    bytes32:
        "The value types bytes1, bytes2, bytes3, …, bytes32 hold a sequence of bytes from one to up to 32.",
    bool: "The bool value data type is used in Solidity to illustrate cases that have binary results. A bool has two fixed values: true or false, with false being the default",
    int: "A signed integer, declared with the int keyword, is a value data type that can be used to store either positive or negative values in smart contracts",
    string: "String literals are written with either double or single-quotes ('foo' or ''bar''), and they can also be split into multiple consecutive parts 'foo' 'bar'",
    uint: "An unsigned integer, declared with the uint keyword, is a value data type that must be non-negative; that is, its value is greater than or equal to zero.",
    address:
        "An address value type is specifically designed to hold up to 20 bytes, or 160 bits, which is the size of an Ethereum address.",
}

Blockly.Extensions.register(
    "state_toolTip",
    Blockly.Extensions.buildTooltipForDropdown("state_variables", TOOLTIPS_BY_STATE)
)

const stateUrl =
    "https://docs.soliditylang.org/en/develop/structure-of-a-contract.html#structure-state-variables"

Blockly.Blocks["contract_state"] = {
    init: function () {
        const nameField = new Blockly.FieldTextInput("Variable Name")
        this.appendDummyInput()
            .appendField(
                new Blockly.FieldDropdown([
                    ["Select Type", "select type"],
                    ["bytes", "bytes"],
                    ["bytes32", "bytes32"],
                    ["bool", "bool"],
                    ["int", "int"],
                    ["string", "string"],
                    ["uint", "uint"],
                    ["address", "address"],
                ]),
                "state_variables"
            )
            .appendField(nameField, "NAME")
        this.setPreviousStatement(true, "contract_state")
        this.setNextStatement(true, null)
        this.setColour(290)
        this.setHelpUrl(stateUrl)

        this._stateNameInitialized = false

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_STATE
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
        Blockly.Extensions.apply("state_toolTip", this, false)
    },
}

Blockly.Blocks["state"] = {
    init: function () {
        const nameField = new Blockly.FieldTextInput("Variable Name")
        this.appendValueInput("state")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([
                    ["bytes", "bytes"],
                    ["bool", "bool"],
                    ["int", "int"],
                    ["string", "string"],
                    ["uint", "uint"],
                    ["address", "address"],
                ]),
                "state_variables"
            )
            .appendField(
                new Blockly.FieldDropdown([
                    ["public", "public"],
                    ["private", "private"],
                ]),
                "visibility"
            )
            .appendField(nameField, "NAME")
        this.setPreviousStatement(true, "contract_state")
        this.setNextStatement(true, null)
        this.setColour(230)
        this.setHelpUrl(stateUrl)

        this._stateNameInitialized = false

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_STATE
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
        Blockly.Extensions.apply("state_toolTip", this, false)
    },
}

Blockly.Blocks["contract_state_get"] = {
    init: function () {
        this.appendDummyInput().appendField(
            new Blockly.FieldDropdown([["select state...", Blockly.Solidity.UNDEFINED_NAME]]),
            "STATE_NAME"
        )
        this.setOutput(true, null)
        this.setColour(95)
        this.setTooltip("assign the value of a state variable to another state or local variable")
        this.setHelpUrl(stateUrl)

        this.getVariableNameSelectField = function () {
            return this.getField("STATE_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_STATE
        }
    },
}

Blockly.Blocks["contract_state_set"] = {
    init: function () {
        this.appendValueInput("STATE_VALUE")
            .appendField("set")
            .appendField(
                new Blockly.FieldDropdown(
                    [["select state...", Blockly.Solidity.UNDEFINED_NAME]],
                    this.validate
                ),
                "STATE_NAME"
            )
            .appendField("to")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setTooltip("Assign value to a state variable")
        this.setHelpUrl(stateUrl)
        this.setColour(195)

        this.getVariableNameSelectField = function () {
            return this.getField("STATE_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_STATE
        }
    },

    validate: function (stateNameVariableId) {
        var workspace = this.sourceBlock_.workspace
        setTimeout(function () {
            Blockly.Solidity.updateWorkspaceStateTypes(workspace)
        }, 1)
        return stateNameVariableId
    },
}

Blockly.Blocks["struct"] = {
    init: function () {
        this.appendStatementInput("NAME")
            .setCheck(null)
            .appendField("Struct")
            .appendField(new Blockly.FieldTextInput("structName"), "NAME")
        this.setInputsInline(false)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(255)
        this.setTooltip("")
        this.setHelpUrl("")
    },
}

Blockly.Blocks["enum"] = {
    init: function () {
        this.appendStatementInput("NAME")
            .setCheck(null)
            .appendField("enum")
            .appendField(new Blockly.FieldTextInput("enumName"), "NAME")
        this.setInputsInline(false)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour("#4287f5")
        this.setTooltip("")
        this.setHelpUrl("")
    },
}

// Mapping blocks.
const mappingUrl = "https://docs.soliditylang.org/en/develop/types.html#mapping-types"

Blockly.Blocks["mapping"] = {
    init: function () {
        const nameField = new Blockly.FieldTextInput("mapping_name")
        this.appendValueInput("key").setCheck(null).appendField("map")
        this.appendValueInput("value").setCheck(null).appendField("to")
        this.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
                ["public", "public"],
                ["private", "private"],
            ]),
            "visibility"
        )
        this.appendDummyInput().appendField(nameField, "NAME")
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(225)
        this.setTooltip("Mapping is an hastable that matches keyTypes to valueTypes")
        this.setHelpUrl(mappingUrl)

        this._stateNameInitialized = false

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_MAP
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

Blockly.Blocks["mapping_set"] = {
    init: function () {
        this.appendValueInput("mapping_name")
            .appendField("set")
            .appendField(
                new Blockly.FieldDropdown(
                    [["select mapping....", Blockly.Solidity.UNDEFINED_NAME]],
                    this.validate
                ),
                "MAPPING_NAME"
            )
        this.appendValueInput("NAME").appendField(
            new Blockly.FieldDropdown([
                ["to", "="],
                ["EQ", "=="],
                ["NEQ", "!="],
                ["GT", ">"],
                ["GTE", ">="],
                ["NGT", "!>"],
                ["LT", "<"],
                ["LTE", "<="],
                ["NLT", "!<"],
                ["add/reassign", "+="],
                ["sub/reassign", "-="],
            ]),
            "compare"
        )
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setTooltip("Set keyTpe and valueType of a mapping")
        this.setHelpUrl(mappingUrl)
        this.setColour(130)

        this.getVariableNameSelectField = function () {
            return this.getField("MAPPING_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_MAP
        }
    },

    validate: function (stateNameVariableId) {
        var workspace = this.sourceBlock_.workspace
        setTimeout(function () {
            Blockly.Solidity.updateWorkspaceStateTypes(workspace)
        }, 1)
        return stateNameVariableId
    },
}

Blockly.Blocks["mapping_get"] = {
    init: function () {
        this.appendValueInput("mapping_name")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([
                    ["select mapping....", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "MAPPING_NAME"
            )
        this.appendValueInput("compare")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([
                    ["null", "null"],
                    ["to", "="],
                    ["EQ", "=="],
                    ["NEQ", "!="],
                    ["GT", ">"],
                    ["GTE", ">="],
                    ["NGT", "!>"],
                    ["LT", "<"],
                    ["LTE", "<="],
                    ["NLT", "!<"],
                    ["add/reassign", "+="],
                    ["sub/reassign", "-="],
                ]),
                "compare"
            )
        this.setInputsInline(false)
        this.setOutput(true, null)
        this.setColour(230)
        this.setTooltip("assign mapping values to another variable")
        this.setHelpUrl(mappingUrl)
        this.getVariableNameSelectField = function () {
            return this.getField("MAPPING_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_MAP
        }
    },
}

Blockly.Blocks["nested_mapping"] = {
    init: function () {
        const nameField = new Blockly.FieldTextInput("nested_mapping_name")
        this.appendValueInput("firstKey").setCheck(null).appendField("map")
        this.appendValueInput("secondKey").setCheck(null).appendField("map")
        this.appendValueInput("value").setCheck(null).appendField("to")
        this.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
                ["public", "public"],
                ["private", "private"],
            ]),
            "visibility"
        )
        this.appendDummyInput().appendField(nameField, "NAME")
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(305)
        this.setTooltip("a mapping type inside another mapping type")
        this.setHelpUrl(mappingUrl)

        this._stateNameInitialized = false

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_NMAP
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }
        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

Blockly.Blocks["nested_mapping_set"] = {
    init: function () {
        this.appendValueInput("nested_mapping_name")
            .appendField("set")
            .appendField(
                new Blockly.FieldDropdown(
                    [["select nestedmap....", Blockly.Solidity.UNDEFINED_NAME]],
                    this.validate
                ),
                "NESTED_MAPPING_NAME"
            )
        this.appendValueInput("map_value")
        this.appendValueInput("NAME").appendField(
            new Blockly.FieldDropdown([
                ["to", "="],
                ["EQ", "=="],
                ["NEQ", "!="],
                ["GT", ">"],
                ["GTE", ">="],
                ["NGT", "!>"],
                ["LT", "<"],
                ["LTE", "<="],
                ["NLT", "!<"],
                ["add/reassign", "+="],
                ["sub/reassign", "-="],
            ]),
            "compare"
        )
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setTooltip("assign value to a mapping variable")
        this.setHelpUrl(mappingUrl)
        this.setColour(180)

        this.getVariableNameSelectField = function () {
            return this.getField("NESTED_MAPPING_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_NMAP
        }
    },

    validate: function (stateNameVariableId) {
        var workspace = this.sourceBlock_.workspace
        setTimeout(function () {
            Blockly.Solidity.updateWorkspaceStateTypes(workspace)
        }, 1)
        return stateNameVariableId
    },
}

Blockly.Blocks["nested_mapping_get"] = {
    init: function () {
        this.appendValueInput("nmap")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([
                    ["select mapping....", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "NESTED_MAPPING_NAME"
            )
        this.appendValueInput("NAME").setCheck(null)
        this.appendValueInput("compare")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([
                    ["null", "null"],
                    ["to", "="],
                    ["EQ", "=="],
                    ["NEQ", "!="],
                    ["GT", ">"],
                    ["GTE", ">="],
                    ["NGT", "!>"],
                    ["LT", "<"],
                    ["LTE", "<="],
                    ["NLT", "!<"],
                    ["add/reassign", "+="],
                    ["sub/reassign", "-="],
                ]),
                "compare"
            )
        this.setInputsInline(true)
        this.setOutput(true, null)
        this.setColour(295)
        this.setTooltip("assign nested-mapping value to another variable")
        this.setHelpUrl(mappingUrl)
        this.getVariableNameSelectField = function () {
            return this.getField("NESTED_MAPPING_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_NMAP
        }
    },
}

// Event-related Blocks
const eventHelpUrl = "https://docs.soliditylang.org/en/develop/abi-spec.html#events"

Blockly.Blocks["event"] = {
    init: function () {
        const nameField = new Blockly.FieldTextInput("name")
        this.appendValueInput("event")
            .setCheck(null)
            .appendField("event")
            .appendField(nameField, "NAME")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(105)
        this.setTooltip(
            "Events are an abstraction of the Ethereum logging/event-watching protocol."
        )
        this.setHelpUrl(eventHelpUrl)

        this._stateNameInitialized = false

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_EVENT
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

Blockly.Blocks["event_get"] = {
    init: function () {
        this.appendValueInput("event_name")
            .setCheck(null)
            .appendField(
                new Blockly.FieldDropdown([["select event....", Blockly.Solidity.UNDEFINED_NAME]]),
                "EVENT_NAME"
            )
        this.setInputsInline(false)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(230)
        this.setTooltip("emit event in function")
        this.setHelpUrl(eventHelpUrl)
        this.getVariableNameSelectField = function () {
            return this.getField("EVENT_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_EVENT
        }
    },
}

Blockly.Blocks["event_parameter"] = {
    init: function () {
        this.appendValueInput("event_parameter")
            .setCheck(null)
            .appendField("Indexed")
            .appendField(
                new Blockly.FieldDropdown([
                    ["integer", "int"],
                    ["address", "address"],
                    ["unsigned integer", "uint"],
                    ["string", "string"],
                    ["bytes", "bytes"],
                    ["bool", "bool"],
                ]),
                "type"
            )
            .appendField(new Blockly.FieldTextInput("name"), "NAME")
        this.setOutput(true, null)
        this.setColour(265)
        this.setTooltip("non-anonymous event parameter that are searchable")
        this.setHelpUrl(eventHelpUrl)
    },
}

Blockly.Blocks["event_param_nonindex"] = {
    init: function () {
        this.appendValueInput("event_parameter")
            .setCheck(null)
            .appendField("non Indexed")
            .appendField(
                new Blockly.FieldDropdown([
                    ["int", "int"],
                    ["address", "address"],
                    ["uint", "uint"],
                    ["string", "string"],
                    ["bytes", "bytes"],
                    ["bool", "bool"],
                ]),
                "type"
            )
            .appendField(new Blockly.FieldTextInput("name"), "NAME")
        this.setOutput(true, null)
        this.setColour(320)
        this.setTooltip("anonymous, non-indexed event parameter")
        this.setHelpUrl(eventHelpUrl)
    },
}

// Global variables

const TOOLTIPS_BY_BLOCKVARIABLE = {
    "block.blockhash":
        "hash of the given block when blocknumber is one of the 256 most recent blocks; otherwise returns zero",
    "block.basefee": "current block's base fee",
    "block.chainid": "current chain id",
    "block.coinbase": "current block miners address",
    "block.difficulty": "current block difficulty",
    "block.gaslimit": "current block gaslimit",
    "block.number": "current block number",
    "block.timestamp": "current block timestamp as seconds since unix epoch",

    // Transaction blocks Tooltip
    "msg.data": "The complete calldata send with the function call",
    "msg.sender": "sender of the message (current call)",
    "msg.value": "the amount of ether sent with the message",
    "tx.gasprice": "gas price of the transaction",
    "tx.origin": "sender of the transaction (full call chain)",
    "gasleft()": "remaining gas",

    // Cryptography block Tooltip
    keccak256: "compute the Keccak-256 hash of the input",
    sha256: "compute the SHA-256 hash of the input",
    ripemd160: "compute RIPEMD-160 hash of the input",

    //  Encode / Decode block Tooltip
    "abi.encode": "ABI-encodes the given arguments",
    "abi.decode":
        "ABI-decodes the given data, while the types are given in parentheses as second argument.",
    "abi.encodePacked": "Performs packed encoding of the given arguments.",
    "abi.encodeWithSelector":
        "ABI-encodes the given arguments starting from the second and prepends the given four-byte selector",
    "abi.encodeWithSignature":
        "Equivalent to abi.encodeWithSelector(bytes4(keccak256(bytes(signature)))",
    "abi.encodeCall":
        "ABI-encodes a call to functionPointer with the arguments found in the tuple. Performs a full type-check, ensuring the types match the function signature",
}

Blockly.Extensions.register(
    "blocksdropdown",
    Blockly.Extensions.buildTooltipForDropdown("global_variables", TOOLTIPS_BY_BLOCKVARIABLE)
)

const globalVariableUrl =
    "https://docs.soliditylang.org/en/develop/units-and-global-variables.html?highlight=error-handling#error-handling"

Blockly.defineBlocksWithJsonArray([
    {
        type: "blockvariables",
        message0: "block %1",
        args0: [
            {
                type: "field_dropdown",
                name: "global_variables",
                options: [
                    ["blockhash", "block.blockhash"],
                    ["basefee", "block.basefee"],
                    ["chainid", "block.chainid"],
                    ["miner address", "block.coinbase"],
                    ["current block difficulty", "block.difficulty"],
                    ["gaslimit", "block.gaslimit"],
                    ["current block number", "block.number"],
                    ["current block timestamp", "block.timestamp"],
                ],
            },
        ],
        output: "String",
        colour: 189,
        helpUrl: globalVariableUrl,
        extensions: ["blocksdropdown"],
    },
])

Blockly.defineBlocksWithJsonArray([
    {
        type: "transactionvariables",
        message0: "Transactions %1",
        args0: [
            {
                type: "field_dropdown",
                name: "global_variables",
                options: [
                    ["complete calldata", "msg.data"],
                    ["function caller", "msg.sender"],
                    ["amount sent", "msg.value"],
                    ["TX gasPrice", "tx.gasprice"],
                    ["TX origin", "tx.origin"],
                    ["Remaining gas", "gasleft()"],
                ],
            },
        ],
        output: "String",
        colour: "#090979",
        helpUrl: globalVariableUrl,
        extensions: ["blocksdropdown"],
    },
])

Blockly.defineBlocksWithJsonArray([
    {
        type: "cryptographyvariables",
        message0: "Cryptography %1",
        args0: [
            {
                type: "field_dropdown",
                name: "global_variables",
                options: [
                    ["Keccak-256 hash of input", "keccak256"],
                    ["SHA-256 hash", "sha256"],
                    ["RIPEMD-160 input hash", "ripemd160"],
                ],
            },
        ],
        output: "String",
        colour: "#d9b428",
        helpUrl: globalVariableUrl,
        extensions: ["blocksdropdown"],
    },
])

Blockly.defineBlocksWithJsonArray([
    {
        type: "encodevariables",
        message0: "Encode/Decode %1",
        args0: [
            {
                type: "field_dropdown",
                name: "global_variables",
                options: [
                    ["Encode", "abi.encode"],
                    ["Decode", "abi.decode"],
                    ["EncodePacked", "abi.encodePacked"],
                    ["EncodeWithSelector", "abi.encodeWithSelector"],
                    ["EncodeWithSignature", "abi.encodeWithSignature"],
                    ["EncodeCall", "abi.encodeCall"],
                ],
            },
        ],
        output: "String",
        colour: "#c61919",
        helpUrl: globalVariableUrl,
        extensions: ["blocksdropdown"],
    },
])

Blockly.defineBlocksWithJsonArray([
    {
        type: "contract_ctor",
        message0: "constructor",
        message1: "parameters %1",
        args1: [
            {
                type: "input_statement",
                name: "PARAMS",
                check: "contract_function_parameter",
                align: "RIGHT",
            },
        ],
        message2: "code %1",
        args2: [
            {
                type: "input_statement",
                name: "STACK",
                align: "RIGHT",
            },
        ],
        previousStatement: ["contract_ctor"],
        colour: 290,
        tooltip:
            "A constructor is an optional function declared with the constructor keyword which is executed upon contract creation, and where you can run contract initialisation code.",
        helpUrl: "https://docs.soliditylang.org/en/develop/contracts.html#constructors",
    },
])

// Modifier

Blockly.Blocks["modifier"] = {
    init: function () {
        this.jsonInit({
            message0: "modifier %1",
            args0: [
                {
                    type: "field_input",
                    name: "NAME",
                    text: "Modifier Name",
                },
            ],
            message1: "parameters %1",
            args1: [
                {
                    type: "input_statement",
                    name: "PARAMS",
                    check: ["modifier_parameter"],
                    align: "RIGHT",
                },
            ],
            message2: "code %1",
            args2: [
                {
                    type: "input_statement",
                    name: "STACK",
                    align: "RIGHT",
                },
            ],
            previousStatement: "modifier",
            nextStatement: "modifier",
            colour: 190,
            tooltip:
                "Modifiers can be used to change the behaviour of functions in a declarative way. For example, you can use a modifier to automatically check a condition prior to executing the function.",
            helpUrl: "https://docs.soliditylang.org/en/develop/contracts.html#function-modifiers",
        })

        this.getVariableNameField = function () {
            return this.getField("NAME")
        }
        this.getVariableType = function () {
            return "void"
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_MODIFIER
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

Blockly.Blocks["modifier_call"] = {
    init: function () {
        this.appendDummyInput("call_modifier")
            .appendField("call modifier")
            .appendField(
                new Blockly.FieldDropdown([
                    ["select modifier...", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "MODIFIER_NAME"
            )
        this.setOutput(true, null)
        this.setTooltip("insert modifier variable into a function declaration")
        this.setHelpUrl(
            "https://docs.soliditylang.org/en/develop/contracts.html#function-modifiers"
        )
        this.setColour(120)

        this.getVariableNameSelectField = function () {
            return this.getField("MODIFIER_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_MODIFIER
        }
    },
}

// contract_function_parameter_memory

Blockly.Blocks["contract_function"] = {
    init: function () {
        this.jsonInit({
            message0: "function %1 %2 %3 %4 %5 %6 %7",
            args0: [
                {
                    type: "field_input",
                    name: "NAME",
                    text: "myFunction",
                },
                {
                    type: "field_dropdown",
                    name: "ACCESS",
                    options: [
                        ["public", "public"],
                        ["private", "private"],
                        ["external", "external"],
                        ["internal", "internal"],
                    ],
                },
                {
                    type: "field_dropdown",
                    name: "STATE_CHANGE",
                    options: [
                        ["none", "none"],
                        ["pure", "pure"],
                        ["view", "view"],
                        ["constant", "constant"],
                        ["payable", "payable"],
                    ],
                },
                {
                    type: "field_dropdown",
                    name: "OVERRIDE",
                    options: [
                        ["Select Override", "none"],
                        ["Override", "override"],
                    ],
                },
                {
                    type: "field_dropdown",
                    name: "Function_Ouput",
                    options: [
                        ["none", "none"],
                        ["bool", "bool"],
                        ["int", "int"],
                        ["uint", "uint"],
                        ["string", "string"],
                        ["address", "address"],
                        ["bytes", "bytes"],
                    ],
                },
                {
                    type: "field_input",
                    name: "Variable_name",
                    text: "VariableName",
                },
                {
                    type: "input_value",
                    name: "MODIFIER",
                    check: "String",
                },
            ],
            message1: "parameters %1",
            args1: [
                {
                    type: "input_statement",
                    name: "PARAMS",
                    check: ["contract_function_parameter"],
                    align: "RIGHT",
                },
            ],
            message2: "code %1",
            args2: [
                {
                    type: "input_statement",
                    name: "STACK",
                    align: "RIGHT",
                },
            ],
            previousStatement: "contract_function",
            nextStatement: "contract_function",
            colour: 290,
            tooltip: "Functions can be defined inside and outside of contracts.",
            helpUrl: "https://docs.soliditylang.org/en/develop/contracts.html#functions",
        })

        this.getVariableNameField = function () {
            return this.getField("NAME")
        }
        this.getVariableType = function () {
            return "void"
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_FUNCTION
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

const parameterToolTip =
    "Function parameters are declared the same way as variables, and the name of unused parameters can be omitted."
const parameterHelpUrl =
    "https://docs.soliditylang.org/en/develop/contracts.html#function-parameters-and-return-variables"

Blockly.Blocks["contract_function_parameter_memory"] = {
    init: function () {
        var nameField = new Blockly.FieldTextInput("p")
        this.appendDummyInput()
            .appendField(
                new Blockly.FieldDropdown([
                    ["bool", "TYPE_BOOL"],
                    ["int", "TYPE_INT"],
                    ["uint", "TYPE_UINT"],
                    ["string", "TYPE_STRING"],
                    ["address", "TYPE_ADDRESS"],
                    ["bytes", "TYPE_BYTE"],
                ]),
                "TYPE"
            )
            .appendField(nameField, "NAME")
        this.setPreviousStatement(true, "contract_function_parameter")
        this.setNextStatement(true, "contract_function_parameter")
        this.setTooltip(parameterToolTip)
        this.setHelpUrl(parameterHelpUrl)
        this.setColour(320)

        this.getVariableNameField = function () {
            return nameField
        }
        this.getVariableType = function () {
            return this.getFieldValue("TYPE")
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_PARAMETER
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract_function" && scope.type != "contract_ctor") {
                scope = scope.getParent()
            }
            return scope
        }

        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

// contract_function_parameter

Blockly.Blocks["contract_function_parameter"] = {
    init: function () {
        // var nameField = new Blockly.FieldTextInput("m");
        this.appendDummyInput()
            .appendField(
                new Blockly.FieldDropdown([
                    ["bool", "TYPE_BOOL"],
                    ["int", "TYPE_INT"],
                    ["uint", "TYPE_UINT"],
                    ["string", "TYPE_STRING"],
                    ["address", "TYPE_ADDRESS"],
                ]),
                "TYPE"
            )
            .appendField(new Blockly.FieldTextInput("m"), "NAME")
        this.setPreviousStatement(
            true,
            "contract_function_parameter",
            "contract_function_parameter_memory"
        )
        this.setNextStatement(
            true,
            "contract_function_parameter",
            "contract_function_parameter_memory"
        )
        this.setTooltip(parameterToolTip)
        this.setHelpUrl(parameterHelpUrl)
        this.setColour(115)

        this.getVariableNameField = function () {
            return this.getField("NAME")
        }
        this.getVariableType = function () {
            return "void"
        }
        this.getVariableGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_PARAMETER
        }
        this.getVariableScope = function () {
            var scope = this.getParent()
            while (!!scope && scope.type != "contract_function" && scope.type != "contract_ctor") {
                scope = scope.getParent()
            }
            return scope
        }
        Blockly.Extensions.apply("declare_typed_variable", this, false)
    },
}

Blockly.Blocks["contract_function_parameter_get"] = {
    init: function () {
        this.appendValueInput("function_get").appendField(
            new Blockly.FieldDropdown([["select param...", Blockly.Solidity.UNDEFINED_NAME]]),
            "PARAM_NAME"
        )
        this.setOutput(true, null)
        this.setTooltip("Assign function parameter to another state or local variable")
        this.setHelpUrl(parameterHelpUrl)
        this.setColour(160)

        this.getVariableNameSelectField = function () {
            return this.getField("PARAM_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_PARAMETER
        }
    },
}

Blockly.Blocks["function_argument"] = {
    init: function () {
        this.appendValueInput("function_argument")
            .setCheck("function_argument")
            .appendField(new Blockly.FieldTextInput("arg"), "NAME")
        this.setInputsInline(false)
        this.setOutput(true, null)
        this.setColour(45)
        this.setTooltip("The block to pass argument to functions")
        this.setHelpUrl(parameterHelpUrl)
    },
}

Blockly.Blocks["contract_function_call"] = {
    init: function () {
        this.appendValueInput("call_function")
            .appendField("call function")
            .appendField(
                new Blockly.FieldDropdown([
                    ["select function...", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "FUNCTION_NAME"
            )
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setTooltip("Call a declared function in another function body")
        this.setHelpUrl("https://docs.soliditylang.org/en/develop/contracts.html#functions")
        this.setColour(320)

        this.getVariableNameSelectField = function () {
            return this.getField("FUNCTION_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_FUNCTION
        }

        this.setOnChange(function (event) {
            if (event.blockId != this.id) {
                return
            }

            if (event.element == "field" && event.name == "FUNCTION_NAME") {
                const functionId = this.getFieldValue("FUNCTION_NAME")
                const functionBlock = this.workspace.getBlockById(functionId)
                const params = []

                var block = functionBlock
                do {
                    block = block.getChildren().filter(function (c) {
                        return c.type == "contract_function_parameter"
                    })[0]

                    if (block) {
                        params.push(block)
                    }
                } while (block)
                console.log(params)
            }
        })
    },
}

Blockly.Blocks["get_function_call"] = {
    init: function () {
        this.appendValueInput("call_function")
            .appendField("call function")
            .appendField(
                new Blockly.FieldDropdown([
                    ["select function...", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "FUNCTION_NAME"
            )
        this.setOutput(true, null)
        this.setTooltip("assign function to a predefined variable")
        this.setHelpUrl("https://docs.soliditylang.org/en/develop/contracts.html#functions")
        this.setColour("#bfb071")

        this.getVariableNameSelectField = function () {
            return this.getField("FUNCTION_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_FUNCTION
        }
    },
}

Blockly.Blocks["no_parameter_function_call"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("call function")
            .appendField(
                new Blockly.FieldDropdown([
                    ["select function...", Blockly.Solidity.UNDEFINED_NAME],
                ]),
                "FUNCTION_NAME"
            )
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setTooltip("call a function that doesn't take a parameter")
        this.setHelpUrl("https://docs.soliditylang.org/en/develop/contracts.html#functions")
        this.setColour("#cf3025")
        this.getVariableNameSelectField = function () {
            return this.getField("FUNCTION_NAME")
        }
        this.getVariableLabelGroup = function () {
            return Blockly.Solidity.LABEL_GROUP_FUNCTION
        }

        this.setOnChange(function (event) {
            if (event.blockId != this.id) {
                return
            }

            if (event.element == "field" && event.name == "FUNCTION_NAME") {
                const functionId = this.getFieldValue("FUNCTION_NAME")
                const functionBlock = this.workspace.getBlockById(functionId)
                const params = []

                var block = functionBlock
                do {
                    block = block.getChildren().filter(function (c) {
                        return c.type == "contract_function_parameter"
                    })[0]

                    if (block) {
                        params.push(block)
                    }
                } while (block)

                console.log(params)
            }
        })
    },
}

Blockly.Blocks["returns"] = {
    init: function () {
        this.appendValueInput("NAME").setCheck(null).appendField("return")
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(195)
        this.setTooltip("Function return")
        this.setHelpUrl("")
    },
}

Blockly.defineBlocksWithJsonArray([
    {
        type: "contract_intrinsic_sha3",
        message0: "sha3 %1",
        args0: [
            {
                type: "input_value",
                name: "VALUE",
            },
        ],
        output: null,
        colour: 60,
        tooltip: "",
        helpUrl: "",
    },
])

// Error-Handling Blocks

Blockly.Blocks["require"] = {
    init: function () {
        this.appendValueInput("require").setCheck(null).appendField("require")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(230)
        this.setTooltip(
            "throws if the condition is not met - to be used for errors in inputs or external components"
        )
        this.setHelpUrl(globalVariableUrl)
    },
}

Blockly.Blocks["assert"] = {
    init: function () {
        this.appendValueInput("assert").setCheck(null).appendField("assert")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(130)
        this.setTooltip("throws if the condition is not met - to be used for internal errors.")
        this.setHelpUrl(globalVariableUrl)
    },
}

Blockly.Blocks["revert"] = {
    init: function () {
        this.appendValueInput("revert").setCheck(null).appendField("revert")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(130)
        this.setTooltip("abort execution and revert state changes, providing an explanatory string")
        this.setHelpUrl(globalVariableUrl)
    },
}

Blockly.Blocks["boolean"] = {
    init: function () {
        this.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
                ["true", "true"],
                ["false", "false"],
            ]),
            "boolean"
        )
        this.setInputsInline(false)
        this.setOutput(true, null)
        this.setColour(75)
        this.setTooltip("boolean: true or false")
        this.setHelpUrl("")
    },
}

// Bitwise Operator
const TOOLTIPS_BY_BITWISE = {
    "~": "takes one number and inverts all bits of it",
    "&": "takes two numbers as operands and does AND on every bit of two numbers. The result of AND is 1 only if both bits are 1.",
    "|": "takes two numbers as operands and does OR on every bit of two numbers. The result of OR is 1 if any of the two bits is 1.",
    "^": "takes two numbers as operands and does XOR on every bit of two numbers. The result of XOR is 1 if the two bits are different.",
    "<<": "takes two numbers, left shifts the bits of the first operand, the second operand decides the number of places to shift.",
    ">>": "takes two numbers, right shifts the bits of the first operand, the second operand decides the number of places to shift.",
}

Blockly.Extensions.register(
    "bitwiser",
    Blockly.Extensions.buildTooltipForDropdown("bitwise", TOOLTIPS_BY_BITWISE)
)
Blockly.Blocks["bitwise"] = {
    init: function () {
        this.appendValueInput("NAME").setCheck(null)
        this.appendDummyInput().appendField(
            new Blockly.FieldDropdown([
                ["Bitwise NOT", "~"],
                ["Bitwise AND", "&"],
                ["Bitwise OR", "|"],
                ["Bitwise XOR", "^"],
                ["Bitwise left shift", "<<"],
                ["Bitwise right shift", ">>"],
            ]),
            "bitwise"
        )
        this.appendValueInput("NAME").setCheck(null)
        this.setInputsInline(true)
        this.setOutput(true, null)
        this.setColour(30)
        this.setHelpUrl(globalVariableUrl)

        Blockly.Extensions.apply("bitwiser", this, false)
    },
}

// General Purpose
Blockly.Blocks["space"] = {
    init: function () {
        this.appendDummyInput().appendField("Space Down")
        this.setInputsInline(false)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(230)
        this.setTooltip("Leave an empty space between code statement")
        this.setHelpUrl("")
    },
}

Blockly.Blocks["inputText"] = {
    init: function () {
        this.appendValueInput("inputText").appendField(new Blockly.FieldTextInput("type"), "NAME")
        this.setOutput(true, "string")
        this.setColour(330)
        this.setTooltip("input any text into a block of your choice")
        this.setHelpUrl("")
    },
}

Blockly.Blocks["parenthesis"] = {
    init: function () {
        this.appendValueInput("parenthesis").appendField("Parenthesis")
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(230)
        this.setTooltip("Create a parenthesis")
        this.setHelpUrl("")
    },
}

Blockly.Blocks["parenthesisText"] = {
    init: function () {
        this.appendValueInput("parenthesis").appendField(
            new Blockly.FieldTextInput("Input Text"),
            "fieldValue"
        )
        this.setInputsInline(true)
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setColour(130)
        this.setTooltip("Create a parenthesis with specified input text")
        this.setHelpUrl("")
    },
}

// Import

Blockly.Blocks["import"] = {
    init: function () {
        const input = new Blockly.FieldTextInput("URL")
        this.appendDummyInput().appendField("import").appendField(input, "IMPORT")
        this.setInputsInline(false)
        this.setPreviousStatement(true, "import")
        this.setNextStatement(true, "import")
        this.setColour(230)
        this.setTooltip(
            "Solidity supports import statements to help modularise your code that are similar to those available in JavaScript"
        )
        this.setHelpUrl(
            "https://docs.soliditylang.org/en/develop/layout-of-source-files.html#importing-other-source-files"
        )
    },
}

Blockly.Blocks["importinherit"] = {
    init: function () {
        this.appendValueInput("function_argument")
            .setCheck("function_argument")
            .appendField(new Blockly.FieldTextInput("Inherit Contract"), "NAME")
        this.setOutput(true, null)
        this.setColour(345)
        this.setTooltip(
            "Inherits access all non-private members including internal functions and state variables from other contracts"
        )
        this.setHelpUrl("https://docs.soliditylang.org/en/develop/contracts.html#inheritance")
    },
}

Blockly.Blocks["comment"] = {
    init: function () {
        this.appendValueInput("comment").appendField(
            new Blockly.FieldTextInput("Comment"),
            "COMMENT"
        )
        this.setPreviousStatement(true)
        this.setNextStatement(true)
        this.setColour(345)
        this.setTooltip("")
        this.setHelpUrl("")
    },
}
