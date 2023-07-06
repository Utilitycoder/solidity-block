import Blockly from "blockly"

export const Solidity = new Blockly.Generator("Solidity")

const objectUtils = Blockly.utils.object
const stringUtils = Blockly.utils.string

Solidity.isInitialized = false

//incomplete list
Solidity.addReservedWords(
    "after,alias,apply,auto,byte,case,copyof,default," +
        "define,final,implements,in,inline,let,macro,match," +
        "mutable,null,of,partial,promise,reference,relocatable,sealed,",
    "sizeof,static,supports,switch,typedef,typeof,var",
    "function,true,false,bool,int8,int,uint8,",
    "uint,address,bytes1,contract,constructor,uint8,",
    "override,virtual,indexed,anonymous,immutable,constant,payable,view,pure,",
    "public,private,external,internal,abi,bytes,block,gasleft,msg,tx,assert,require,",
    "revert,blockhash,keccak256,sha256,ripemd160,ecrecover,addmod,mulmod,this,",
    "super,selfdestruct,type"
)
Solidity.ORDER_ATOMIC = 0 // 0 "" ...
Solidity.ORDER_NEW = 1.1 // new
Solidity.ORDER_MEMBER = 1.2 // . []
Solidity.ORDER_FUNCTION_CALL = 2 // ()
Solidity.ORDER_INCREMENT = 3 // ++
Solidity.ORDER_DECREMENT = 3 // --
Solidity.ORDER_BITWISE_NOT = 4.1 // ~
Solidity.ORDER_UNARY_PLUS = 4.2 // +
Solidity.ORDER_UNARY_NEGATION = 4.3 // -
Solidity.ORDER_LOGICAL_NOT = 4.4 // !
Solidity.ORDER_TYPEOF = 4.5 // typeof
Solidity.ORDER_VOID = 4.6 // void
Solidity.ORDER_DELETE = 4.7 // delete
Solidity.ORDER_DIVISION = 5.1 // /
Solidity.ORDER_MULTIPLICATION = 5.2 // *
Solidity.ORDER_MODULUS = 5.3 // %
Solidity.ORDER_SUBTRACTION = 6.1 // -
Solidity.ORDER_ADDITION = 6.2 // +
Solidity.ORDER_BITWISE_SHIFT = 7 // << >> >>>
Solidity.ORDER_RELATIONAL = 8 // < <= > >=
Solidity.ORDER_IN = 8 // in
Solidity.ORDER_INSTANCEOF = 8 // instanceof
Solidity.ORDER_EQUALITY = 9 // == != === !==
Solidity.ORDER_BITWISE_AND = 10 // &
Solidity.ORDER_BITWISE_XOR = 11 // ^
Solidity.ORDER_BITWISE_OR = 12 // |
Solidity.ORDER_LOGICAL_AND = 13 // &&
Solidity.ORDER_LOGICAL_OR = 14 // ||
Solidity.ORDER_CONDITIONAL = 15 // ?:
Solidity.ORDER_ASSIGNMENT = 16 // = += -= *= /= %= <<= >>= ...
Solidity.ORDER_COMMA = 17 // ,
Solidity.ORDER_NONE = 99 // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array<!Array<number>>}
 */
Solidity.ORDER_OVERRIDES = [
    // (foo()).bar -> foo().bar
    // (foo())[0] -> foo()[0]
    [Solidity.ORDER_FUNCTION_CALL, Solidity.ORDER_MEMBER],
    // (foo())() -> foo()()
    [Solidity.ORDER_FUNCTION_CALL, Solidity.ORDER_FUNCTION_CALL],
    // (foo.bar).baz -> foo.bar.baz
    // (foo.bar)[0] -> foo.bar[0]
    // (foo[0]).bar -> foo[0].bar
    // (foo[0])[1] -> foo[0][1]
    [Solidity.ORDER_MEMBER, Solidity.ORDER_MEMBER],
    // (foo.bar)() -> foo.bar()
    // (foo[0])() -> foo[0]()
    [Solidity.ORDER_MEMBER, Solidity.ORDER_FUNCTION_CALL],

    // !(!foo) -> !!foo
    [Solidity.ORDER_LOGICAL_NOT, Solidity.ORDER_LOGICAL_NOT],
    // a * (b * c) -> a * b * c
    [Solidity.ORDER_MULTIPLICATION, Solidity.ORDER_MULTIPLICATION],
    // a + (b + c) -> a + b + c
    [Solidity.ORDER_ADDITION, Solidity.ORDER_ADDITION],
    // a && (b && c) -> a && b && c
    [Solidity.ORDER_LOGICAL_AND, Solidity.ORDER_LOGICAL_AND],
    // a || (b || c) -> a || b || c
    [Solidity.ORDER_LOGICAL_OR, Solidity.ORDER_LOGICAL_OR],
]

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
Solidity.isInitialized = false

/**
 * Initialise the database of variable names.
 * @param {!Workspace} workspace Workspace to generate code from.
 */
Solidity.init = function (workspace) {
    // Call Blockly.Generator's init.
    Object.getPrototypeOf(this).init.call(this)

    if (!this.nameDB_) {
        this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_)
    } else {
        this.nameDB_.reset()
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap())
    this.nameDB_.populateVariables(workspace)
    this.nameDB_.populateProcedures(workspace)

    this.isInitialized = true
}

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Solidity.finish = function (code) {
    // Convert the definitions dictionary into a list.
    const definitions = objectUtils.values(this.definitions_)
    // Call Blockly.Generator's finish.
    code = Object.getPrototypeOf(this).finish.call(this, code)
    this.isInitialized = false

    this.nameDB_.reset()

    return definitions.join("\n\n") + "\n\n\n" + code
}

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Solidity.scrubNakedValue = function (line) {
    return line + ";\n"
}

/**
 * Encode a string as a properly escaped Solidity string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Solidity string.
 * @protected
 */
Solidity.quote_ = function (string) {
    // Can't use goog.string.quote since Google's style guide recommends
    // JS string literals use single quotes.
    string = string.replace(/\\/g, "\\\\").replace(/\n/g, "\\\n").replace(/'/g, "\\'")
    return "'" + string + "'"
}

/**
 * Encode a string as a properly escaped multiline Solidity string, complete
 * with quotes.
 * @param {string} string Text to encode.
 * @return {string} Solidity string.
 * @protected
 */
Solidity.multiline_quote_ = function (string) {
    // Can't use goog.string.quote since Google's style guide recommends
    // JS string literals use single quotes.
    const lines = string.split(/\n/g).map(this.quote_)
    return lines.join(" + '\\n' +\n")
}

/**
 * Common tasks for generating Solidity from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Block} block The current block.
 * @param {string} code The Solidity code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Solidity code with comments and subsequent blocks added.
 * @protected
 */
Solidity.scrub_ = function (block, code) {
    let commentCode = ""
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
        // Collect comment for this block.
        let comment = block.getCommentText()
        comment = Blockly.utils.wrap ? Blockly.utils.wrap(comment, Solidity.COMMENT_WRAP - 3) : ""
        if (comment) {
            if (block.getProcedureDef) {
                // Use a comment block for function comments.
                commentCode += "/**\n" + Solidity.prefixLines(comment + "\n", " * ") + " */\n"
            } else {
                commentCode += Solidity.prefixLines(comment + "\n", "// ")
            }
        }
        // Collect comments for all value arguments.
        // Don't collect comments for nested statements.
        for (let i = 0; i < block.inputList.length; i++) {
            if (block.inputList[i].type === Blockly.INPUT_VALUE) {
                let childBlock = block.inputList[i].connection.targetBlock()
                if (childBlock) {
                    comment = Solidity.allNestedComments(childBlock)
                    if (comment) {
                        commentCode += Solidity.prefixLines(comment, "// ")
                    }
                }
            }
        }
    }
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock()
    const nextCode = Solidity.blockToCode(nextBlock)
    return commentCode + code + nextCode
}

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Solidity.getAdjusted = function (block, atId, opt_delta, opt_negate, opt_order) {
    let delta = opt_delta || 0
    let order = opt_order || this.ORDER_NONE
    if (block.workspace.options.oneBasedIndex) {
        delta--
    }
    const defaultAtIndex = block.workspace.options.oneBasedIndex ? "1" : "0"

    let innerOrder
    let outerOrder = order
    if (delta > 0) {
        outerOrder = this.ORDER_ADDITION
        innerOrder = this.ORDER_ADDITION
    } else if (delta < 0) {
        outerOrder = this.ORDER_SUBTRACTION
        innerOrder = this.ORDER_SUBTRACTION
    } else if (opt_negate) {
        outerOrder = this.ORDER_UNARY_NEGATION
        innerOrder = this.ORDER_UNARY_NEGATION
    }

    let at = this.valueToCode(block, atId, outerOrder) || defaultAtIndex

    if (stringUtils.isNumber(at)) {
        // If the index is a naked number, adjust it right now.
        at = Number(at) + delta
        if (opt_negate) {
            at = -at
        }
    } else {
        // If the index is dynamic, adjust it in code.
        if (delta > 0) {
            at = at + " + " + delta
        } else if (delta < 0) {
            at = at + " - " + -delta
        }
        if (opt_negate) {
            if (delta) {
                at = "-(" + at + ")"
            } else {
                at = "-" + at
            }
        }
        innerOrder = Math.floor(innerOrder)
        order = Math.floor(order)
        if (innerOrder && order >= innerOrder) {
            at = "(" + at + ")"
        }
    }
    return at
}

Solidity.updateWorkspaceNameFields = function (workspace) {
    const blocks = workspace.getAllBlocks()
    for (let i = 0; i < blocks.length; ++i) {
        let nameField = blocks[i].getVariableNameSelectField
            ? blocks[i].getVariableNameSelectField()
            : null
        let group = blocks[i].getVariableLabelGroup ? blocks[i].getVariableLabelGroup() : null

        if (!!nameField && !!group) {
            const vars = Solidity.getVariablesInScope(blocks[i], group)
            const options = vars.map(function (v) {
                return [Solidity.getVariableName(v), v.id_]
            })

            let selectedOption = nameField.getValue()

            if (options.length !== 0) {
                const wasUndefined = nameField.menuGenerator_[0][1] === Solidity.UNDEFINED_NAME

                nameField.menuGenerator_ = options
                if (wasUndefined) {
                    nameField.setValue(options[0][1])
                } else {
                    nameField.setValue(selectedOption)
                    // The text input does not redraw/update itself after we call "setValue",
                    // so we set the text manually.
                    // nameField.setText(
                    //   options.filter(function (o) { return o[1] == selectedOption })[0][0]
                    // );
                }
            }
        }
    }
}

Solidity.updateWorkspaceTypes = function (workspace, nameFieldName, valueFieldName) {
    const blocks = workspace.getAllBlocks()

    for (let i = 0; i < blocks.length; ++i) {
        const stateNameField = blocks[i].getField(nameFieldName)

        if (!stateNameField) {
            continue
        }

        const variableId = blocks[i].getFieldValue(nameFieldName)
        const variable = workspace.getVariableById(variableId)

        if (!variable) {
            return
        }

        if (blocks[i].inputList[0] && blocks[i].inputList[0].name === valueFieldName) {
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
                case "TYPE_STRING":
                    blocks[i].inputList[0].setCheck("String")
                    break
                case "TYPE_ADDRESS":
                    blocks[i].inputList[0].setCheck("String")
                    break
                default:
            }
        }
        // TODO: update the output type
    }
}

Solidity.updateWorkspaceStateTypes = function (workspace) {
    Solidity.updateWorkspaceTypes(workspace, "STATE_NAME", "STATE_VALUE")
}

Solidity.updateWorkspaceParameterTypes = function (workspace) {
    Solidity.updateWorkspaceTypes(workspace, "PARAM_NAME", "PARAM_VALUE")
}

Solidity.createVariable = function (workspace, group, type, name, scope, id) {
    const variable = workspace.createVariable(name, type, id)

    variable.group = group
    variable.scope = scope

    Solidity.setVariableName(variable, name)

    return variable
}

Solidity.getVariableById = function (workspace, id) {
    return workspace.getVariableById(id)
}

Solidity.getVariableByName = function (workspace, name) {
    return Solidity.getAllVariables(workspace).filter(function (v) {
        return Solidity.getVariableName(v) === name
    })[0]
}

Solidity.getVariableByNameAndScope = function (name, scope, group = null) {
    return Solidity.getVariablesInScope(scope, group).filter(function (v) {
        return Solidity.getVariableName(v) === name
    })[0]
}

Solidity.deleteVariableById = function (workspace, id) {
    Solidity.deleteVariableByName(workspace, Solidity.getVariableById(workspace, id).name)
}

Solidity.deleteVariableByName = function (workspace, name) {
    return workspace.deleteVariable(name)
}

Solidity.variableIsInScope = function (variable, scope) {
    while (!!scope && scope.id != variable.scope.id) {
        const type = scope.type
        do {
            scope = scope.getParent()
        } while (scope && type === scope.type)
    }

    return !!scope
}

Solidity.setVariableName = function (variable, name) {
    variable.name = '_scope("' + variable.scope.id + '")_' + name
}

Solidity.getVariableName = function (variable) {
    return variable.name.replace('_scope("' + variable.scope.id + '")_', "")
}

Solidity.getAllVariables = function (workspace) {
    return workspace.getAllVariables()
}

Solidity.getVariablesInScope = function (block, group = null) {
    return Solidity.getAllVariables(block.workspace)
        .filter(function (v) {
            return Solidity.variableIsInScope(v, block)
        })
        .filter(function (v) {
            return !group || v.group === group
        })
}

Solidity["contract"] = function (block) {
    const importBlock = Solidity.statementToCode(block, "IMPORT")
    const newArr = importBlock
        .split(";")
        .map((x) => x.split("/"))
        .map((subarray) => subarray[subarray.length - 1])
    newArr.pop()
    const finalArr = newArr.map((y) => y.split(".")).map((subarray) => subarray[0])

    const value = Solidity.valueToCode(block, "INHERIT", Solidity.ORDER_ATOMIC)
    let inheritance = value ? `is ${value}` : ""

    let states = Solidity.statementToCode(block, "STATES")
    if (states.length > 0) {
        states += "\n"
    }
    let ctor = Solidity.statementToCode(block, "CTOR")
    let modifier = Solidity.statementToCode(block, "MODIFIERS")
    let functions = Solidity.statementToCode(block, "FUNCTIONS")

    // trim newline before ultimate closing curly brace
    if (functions.length > 0) {
        functions = functions.slice(0, -2)
    } else if (ctor.length > 0) {
        ctor = ctor.slice(0, -2)
    }

    var code =
        `//SPDX-License-Identifier: ${block.getFieldValue("LICENSE")}\n\n` +
        `pragma solidity ^${block.getFieldValue("PRAGMA")};\n\n` +
        `${importBlock}\n` +
        `contract ${block.getFieldValue("NAME")} ${inheritance}` +
        " {\n\n" +
        states +
        ctor +
        modifier +
        functions +
        "}\n"

    return code
}

Solidity["contract_state"] = function (block) {
    const state_variables = block.getFieldValue("state_variables")
    const state_name = block.getFieldValue("NAME")
    const code = `${state_variables} ${state_name};\n`
    return code
}

Solidity["contract_state_get"] = function (block) {
    const variableId = block.getFieldValue("STATE_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return [Solidity.getVariableName(variable), Solidity.ORDER_ATOMIC]
}

Solidity["contract_state_set"] = function (block) {
    // Variable setter.
    const argument0 = Solidity.valueToCode(block, "STATE_VALUE", Solidity.ORDER_ASSIGNMENT) || "0"
    const variableId = block.getFieldValue("STATE_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return Solidity.getVariableName(variable) + " = " + argument0 + ";\n"
}

Solidity["contract_local_get"] = function (block) {
    const variableId = block.getFieldValue("LOCAL_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return [Solidity.getVariableName(variable), Solidity.ORDER_ATOMIC]
}

Solidity["state"] = function (block) {
    const state_variables = block.getFieldValue("state_variables")
    const visibility = block.getFieldValue("visibility")
    const state_name = block.getFieldValue("NAME")
    const value_state = Solidity.valueToCode(block, "state", Solidity.ORDER_ASSIGNMENT)
    let state_value
    if (!value_state) {
        state_value = ""
    } else {
        state_value = ` = ${value_state}`
    }
    const code = `${state_variables} ${visibility} ${state_name}${state_value};\n`
    return code
}

Solidity["struct"] = function (block) {
    const text_name = block.getFieldValue("NAME")
    let statements_name = Solidity.statementToCode(block, "NAME")
    const code = `struct ${text_name} {\n${statements_name}}\n\n`
    return code
}

Solidity["enum"] = function (block) {
  const text_name = block.getFieldValue("NAME")
  let statements_name = Solidity.statementToCode(block, "NAME")
  const code = `enum ${text_name} {\n${statements_name}}\n\n`
  return code
}

Solidity["contract_function"] = function (block) {
    const params = Solidity.statementToCode(block, "PARAMS").trim()
    const branch = Solidity.statementToCode(block, "STACK")
    const stateChange = block.getFieldValue("STATE_CHANGE")
    const override = block.getFieldValue("OVERRIDE")
    const functionReturns = block.getFieldValue("Function_Ouput")
    const returnsName = block.getFieldValue("Variable_name")
    const inputValue = Solidity.valueToCode(block, "MODIFIER", Solidity.ORDER_ATOMIC)

    const changeState = stateChange == "none" ? "" : stateChange
    const overrideState = override == "none" ? "" : override
    const returnFunction =
        functionReturns == "none" ? "" : `returns (${functionReturns} ${returnsName})`

    const code = `function ${block.getFieldValue("NAME")}(${params}) ${block.getFieldValue(
        "ACCESS"
    )} ${changeState} ${overrideState} ${inputValue} ${returnFunction} {\n${branch}\n}\n\n`

    return code
}

Solidity["contract_ctor"] = function (block) {
    const parent = block.getSurroundParent()

    if (!parent) {
        return ""
    }

    const params = Solidity.statementToCode(block, "PARAMS").trim()
    const branch = Solidity.statementToCode(block, "STACK")
    const code = "constructor " + "(" + params + ") {\n" + branch + "}\n\n"

    return code
}

Solidity["contract_function_parameter_memory"] = function (block) {
    const name = block.getFieldValue("NAME")
    const nextBlock = block.getNextBlock()
    const sep = nextBlock ? ", " : ""
    const types = {
        TYPE_BOOL: "bool",
        TYPE_INT: "int",
        TYPE_UINT: "uint",
        TYPE_STRING: "string",
        TYPE_ADDRESS: "address",
        TYPE_BYTE: "bytes",
    }

    return `${types[block.getFieldValue("TYPE")]} memory ${name}${sep}\n`
}

Solidity["contract_function_parameter"] = function (block) {
    const name = block.getFieldValue("NAME")
    const nextBlock = block.getNextBlock()
    const sep = nextBlock ? ", " : ""
    const types = {
        TYPE_BOOL: "bool",
        TYPE_INT: "int",
        TYPE_UINT: "uint",
        TYPE_STRING: "string",
        TYPE_ADDRESS: "address",
    }

    return `${types[block.getFieldValue("TYPE")]} ${name}${sep}\n`
}

Solidity["contract_function_parameter_get"] = function (block) {
    const inputValue = Solidity.valueToCode(block, "function_get", Solidity.ORDER_ATOMIC)
    const setValue = block.getInputTargetBlock("function_get")
    const inp = setValue == null ? "" : ", "
    const variableId = block.getFieldValue("PARAM_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return [`${Solidity.getVariableName(variable)}${inp}${inputValue}`, Solidity.ORDER_ATOMIC]
}

Solidity["contract_function_call"] = function (block) {
    const value = Solidity.valueToCode(block, "call_function", Solidity.ORDER_ASSIGNMENT)
    const variableId = block.getFieldValue("FUNCTION_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return `${Solidity.getVariableName(variable)}(${value});\n`
}

Solidity["get_function_call"] = function (block) {
    const value = Solidity.valueToCode(block, "call_function", Solidity.ORDER_ASSIGNMENT)
    const variableId = block.getFieldValue("FUNCTION_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return [`${Solidity.getVariableName(variable)}(${value})`, Solidity.ORDER_ATOMIC]
}

Solidity["no_parameter_function_call"] = function (block) {
    const variableId = block.getFieldValue("FUNCTION_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return `${Solidity.getVariableName(variable)}();\n`
}

Solidity["function_argument"] = function (block) {
    const text_name = block.getFieldValue("NAME")
    const value_function_argument = Solidity.valueToCode(
        block,
        "function_argument",
        Solidity.ORDER_ATOMIC
    )
    const inputBlock = block.getInputTargetBlock("function_argument")
    const inp = inputBlock == null ? "" : ", "
    const code = `${text_name}${inp}${value_function_argument}`

    return [code, Solidity.ORDER_ATOMIC]
}

// Mapping Generated Code
Solidity["mapping"] = function (block) {
    const key = Solidity.valueToCode(block, "key", Solidity.ORDER_ASSIGNMENT)
    const value = Solidity.valueToCode(block, "value", Solidity.ORDER_ASSIGNMENT)
    const dropdown_visibility = block.getFieldValue("visibility")
    const text_name = block.getFieldValue("NAME")
    const code = `mapping(${key} => ${value}) ${dropdown_visibility} ${text_name};\n`
    return code
}

Solidity["mapping_get"] = function (block) {
    const dropdown_mapping_name = block.getFieldValue("MAPPING_NAME")
    const value_mapping_name =
        Solidity.valueToCode(block, "mapping_name", Solidity.ORDER_ATOMIC) || "0"
    const dropdown_compare = block.getFieldValue("compare")
    const setDropDown = dropdown_compare == "null" ? "" : dropdown_compare
    const value_compare = Solidity.valueToCode(block, "compare", Solidity.ORDER_ASSIGNMENT)

    const variableId = dropdown_mapping_name
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    const code = `${Solidity.getVariableName(
        variable
    )}[${value_mapping_name}] ${setDropDown} ${value_compare}`

    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["mapping_set"] = function (block) {
    // Variable setter.
    const argument0 = Solidity.valueToCode(block, "mapping_name", Solidity.ORDER_ASSIGNMENT) || "0"
    const argument1 = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ASSIGNMENT)
    const setMapping = block.getFieldValue("compare")
    const variableId = block.getFieldValue("MAPPING_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return `${Solidity.getVariableName(variable)}[${argument0}] ${setMapping} ${argument1};\n`
}

Solidity["nested_mapping"] = function (block) {
    const firstKey = Solidity.valueToCode(block, "firstKey", Solidity.ORDER_ASSIGNMENT)
    const secondKey = Solidity.valueToCode(block, "secondKey", Solidity.ORDER_ASSIGNMENT)
    const value = Solidity.valueToCode(block, "value", Solidity.ORDER_ASSIGNMENT)
    const dropdown_visibility = block.getFieldValue("visibility")
    const text_name = block.getFieldValue("NAME")
    const code = `mapping(${firstKey} => mapping(${secondKey} => ${value})) ${dropdown_visibility} ${text_name};\n`
    return code
}

Solidity["nested_mapping_set"] = function (block) {
    // Variable setter.
    const argument0 =
        Solidity.valueToCode(block, "nested_mapping_name", Solidity.ORDER_ASSIGNMENT) || "0"
    const argument1 = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ASSIGNMENT)
    const argument2 = Solidity.valueToCode(block, "map_value", Solidity.ORDER_ASSIGNMENT)
    const setMapping = block.getFieldValue("compare")
    const variableId = block.getFieldValue("NESTED_MAPPING_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return `${Solidity.getVariableName(
        variable
    )}[${argument0}][${argument2}] ${setMapping} ${argument1};\n`
}

Solidity["nested_mapping_get"] = function (block) {
    const nested_mapping_name = block.getFieldValue("NESTED_MAPPING_NAME")
    const value_mapping_name =
        Solidity.valueToCode(block, "mapping_name", Solidity.ORDER_ATOMIC) || "0"
    const value_name = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ATOMIC) || "0"
    const dropdown_compare = block.getFieldValue("compare")
    const setDropDown = dropdown_compare == "null" ? "" : dropdown_compare
    const value_compare = Solidity.valueToCode(block, "compare", Solidity.ORDER_ASSIGNMENT) || "0"

    const variableId = nested_mapping_name
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    const code = `${Solidity.getVariableName(
        variable
    )}[${value_mapping_name}][${value_name}] ${setDropDown} ${value_compare}`

    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["event"] = function (block) {
    const text_name = block.getFieldValue("NAME")
    const value_event = Solidity.valueToCode(block, "event", Solidity.ORDER_ATOMIC).trim()
    const code = `event ${text_name}(${value_event});\n`
    return code
}

Solidity["event_get"] = function (block) {
    const variableId = block.getFieldValue("EVENT_NAME")
    const value_mapping_name =
        Solidity.valueToCode(block, "event_name", Solidity.ORDER_ATOMIC) || "0"

    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    const code = `emit ${Solidity.getVariableName(variable)}(${value_mapping_name});\n`

    return code
}

Solidity["event_parameter"] = function (block) {
    const dropdown_type = block.getFieldValue("type")
    const text_name = block.getFieldValue("NAME")
    const event_parameter = Solidity.valueToCode(block, "event_parameter", Solidity.ORDER_ATOMIC)

    const code = `${dropdown_type} indexed ${text_name}, ${event_parameter}`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["event_param_nonindex"] = function (block) {
    const dropdown_type = block.getFieldValue("type")
    const text_name = block.getFieldValue("NAME")
    const event_parameter = Solidity.valueToCode(block, "event_parameter", Solidity.ORDER_ATOMIC)
    const code = `${dropdown_type} ${text_name} ${event_parameter}`

    return [code, Solidity.ORDER_ATOMIC]
}

// General Purpose
Solidity["space"] = function (block) {
    const code = `\n`
    return code
}

Solidity["parenthesis"] = function (block) {
    const event_parameter = Solidity.valueToCode(block, "parenthesis", Solidity.ORDER_ATOMIC)
    const code = `(${event_parameter})`
    return code
}

Solidity["parenthesisText"] = function (block) {
    const input_value = block.getFieldValue("fieldValue")
    const event_parameter = Solidity.valueToCode(block, "parenthesis", Solidity.ORDER_ATOMIC)
    const code = `${input_value}(${event_parameter});\n`
    return code
}

Solidity["inputText"] = function (block) {
    const input = block.getFieldValue("NAME")
    const value = Solidity.valueToCode(block, "inputText", Solidity.ORDER_ATOMIC)
    const inputBlock = block.getInputTargetBlock("inputText")
    let inp = !inputBlock ? "" : ", "
    const code = `${input}${inp}${value}`
    return [code, Solidity.ORDER_ATOMIC]
}

// Error-Handling
Solidity["require"] = function (block) {
    const value_require = Solidity.valueToCode(block, "require", Solidity.ORDER_ATOMIC)
    const code = `require(${value_require});\n`
    return code
}

Solidity["assert"] = function (block) {
    const value_assert = Solidity.valueToCode(block, "assert", Solidity.ORDER_ATOMIC)
    const code = `assert(${value_assert});\n`
    return code
}

Solidity["revert"] = function (block) {
    const value_revert = Solidity.valueToCode(block, "revert", Solidity.ORDER_ATOMIC)
    const code = `revert(${value_revert});\n`
    return code
}

// Modifier-related Code Generation Below

Solidity["modifier"] = function (block) {
    const params = Solidity.statementToCode(block, "PARAMS").trim()
    const branch = Solidity.statementToCode(block, "STACK")
    const code = `modifier ${block.getFieldValue("NAME")}(${params}) {\n${branch}\n}\n\n`

    return code
}

Solidity["modifier_call"] = function (block) {
    const variableId = block.getFieldValue("MODIFIER_NAME")
    const variable = block.workspace.getVariableById(variableId)

    if (!variable) {
        return ""
    }

    return [Solidity.getVariableName(variable), Solidity.ORDER_ATOMIC]
}

//  Global Variables Code Generation Below

Solidity["blockvariables"] = function (block) {
    const dropdown_type = block.getFieldValue("blocks")
    const event_parameter = Solidity.valueToCode(block, "blockvariables", Solidity.ORDER_ATOMIC)
    const inputBlock = block.getInputTargetBlock("blockvariables")
    const inp = inputBlock == null ? "" : ", "

    const code = `${dropdown_type}${inp}${event_parameter}`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["transactionvariables"] = function (block) {
    const dropdown_type = block.getFieldValue("transactionvariables")
    const event_parameter = Solidity.valueToCode(
        block,
        "transactionvariables",
        Solidity.ORDER_ATOMIC
    )
    const inputBlock = block.getInputTargetBlock("transactionvariables")
    const inp = inputBlock == null ? "" : ", "

    const code = `${dropdown_type}${inp}${event_parameter}`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["cryptographyvariables"] = function (block) {
    const dropdown_type = block.getFieldValue("cryptographyvariables")
    const event_parameter = Solidity.valueToCode(
        block,
        "cryptographyvariables",
        Solidity.ORDER_ATOMIC
    )

    const code = `${dropdown_type}(${event_parameter})`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["encodevariables"] = function (block) {
    const dropdown_type = block.getFieldValue("encodevariables")
    const event_parameter = Solidity.valueToCode(block, "encodevariables", Solidity.ORDER_ATOMIC)

    const code = `${dropdown_type}(${event_parameter})`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["returns"] = function (block) {
    const value_name = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ATOMIC)
    const code = `return ${value_name};\n`
    return code
}

//  Import-related Code Generation Below

Solidity["import"] = function (block) {
    const text_name = block.getFieldValue("IMPORT")
    const code = `import "${text_name}";\n`
    return code
}

Solidity["importinherit"] = function (block) {
    const text_name = block.getFieldValue("NAME")
    const value_function_argument = Solidity.valueToCode(
        block,
        "function_argument",
        Solidity.ORDER_ATOMIC
    )
    const inputBlock = block.getInputTargetBlock("function_argument")
    const inp = inputBlock == null ? "" : ", "
    const code = `${text_name}${inp}${value_function_argument}`

    return [code, Solidity.ORDER_ATOMIC]
}

//  Import-related Code Generation Below

Solidity["boolean"] = function (block) {
    const dropdown_boolean = block.getFieldValue("boolean")
    const code = dropdown_boolean
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["comment"] = function (block) {
    const text_name = block.getFieldValue("COMMENT")
    const code = `// ${text_name}\n`

    return code
}

// Bitwise
Solidity["bitwise"] = function (block) {
    const value0 = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ATOMIC)
    const dropdown_bitwise = block.getFieldValue("bitwise")
    const value1 = Solidity.valueToCode(block, "NAME", Solidity.ORDER_ATOMIC)
    const code = `${value0} ${dropdown_bitwise} ${value1}`
    return [code, Solidity.ORDER_NONE]
}

Solidity["controls_if"] = function (block) {
    // If/elseif/else condition.
    const n = 0
    let code = "",
        branchCode,
        conditionCode
    do {
        conditionCode = Solidity.valueToCode(block, "IF" + n, Solidity.ORDER_NONE) || "false"
        branchCode = Solidity.statementToCode(block, "DO" + n)
        code += (n > 0 ? " else " : "") + "if (" + conditionCode + ") {\n" + branchCode + "}"

        ++n
    } while (block.getInput("IF" + n))

    if (block.getInput("ELSE")) {
        branchCode = Solidity.statementToCode(block, "ELSE")
        code += " else {\n" + branchCode + "}"
    }
    return code + "\n"
}

Solidity["controls_ifelse"] = Solidity["controls_if"]

Solidity["logic_compare"] = function (block) {
    // Comparison operator.
    const OPERATORS = {
        EQ: "==",
        NEQ: "!=",
        LT: "<",
        LTE: "<=",
        GT: ">",
        GTE: ">=",
    }
    const operator = OPERATORS[block.getFieldValue("OP")]
    // var order =
    //   operator == "==" || operator == "!="
    //     ? Solidity.ORDER_EQUALITY
    //     : Solidity.ORDER_RELATIONAL;
    const argument0 = Solidity.valueToCode(block, "A", Solidity.ORDER_ATOMIC) || "0"
    const argument1 = Solidity.valueToCode(block, "B", Solidity.ORDER_ATOMIC) || "0"
    const code = `${argument0} ${operator} ${argument1}`
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["logic_operation"] = function (block) {
    // Operations 'and', 'or'.
    const operator = block.getFieldValue("OP") == "AND" ? "&&" : "||"
    const order = operator == "&&" ? Solidity.ORDER_LOGICAL_AND : Solidity.ORDER_LOGICAL_OR
    let argument0 = Solidity.valueToCode(block, "A", order)
    let argument1 = Solidity.valueToCode(block, "B", order)
    if (!argument0 && !argument1) {
        // If there are no arguments, then the return value is false.
        argument0 = "false"
        argument1 = "false"
    } else {
        // Single missing arguments have no effect on the return value.
        const defaultArgument = operator == "&&" ? "true" : "false"
        if (!argument0) {
            argument0 = defaultArgument
        }
        if (!argument1) {
            argument1 = defaultArgument
        }
    }
    const code = argument0 + " " + operator + " " + argument1
    return [code, order]
}

Solidity["logic_negate"] = function (block) {
    // Negation.
    const order = Solidity.ORDER_LOGICAL_NOT
    const argument0 = Solidity.valueToCode(block, "BOOL", order) || "true"
    const code = "!" + argument0
    return [code, order]
}

Solidity["logic_null"] = function (block) {
    // Null data type.
    return ["null", Solidity.ORDER_ATOMIC]
}

Solidity["logic_ternary"] = function (block) {
    // Ternary operator.
    const value_if = Solidity.valueToCode(block, "IF", Solidity.ORDER_CONDITIONAL) || "false"
    const value_then = Solidity.valueToCode(block, "THEN", Solidity.ORDER_CONDITIONAL) || "null"
    const value_else = Solidity.valueToCode(block, "ELSE", Solidity.ORDER_CONDITIONAL) || "null"
    const code = value_if + " ? " + value_then + " : " + value_else
    return [code, Solidity.ORDER_CONDITIONAL]
}

Solidity["math_number"] = function (block) {
    // Numeric value.
    const code = parseFloat(block.getFieldValue("NUM"))
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["math_arithmetic"] = function (block) {
    // Basic arithmetic operators, and power.
    const OPERATORS = {
        ADD: [" + ", Solidity.ORDER_ADDITION],
        MINUS: [" - ", Solidity.ORDER_SUBTRACTION],
        MULTIPLY: [" * ", Solidity.ORDER_MULTIPLICATION],
        DIVIDE: [" / ", Solidity.ORDER_DIVISION],
        POWER: [" ** ", Solidity.ORDER_EXPONENTATION],
    }
    const tuple = OPERATORS[block.getFieldValue("OP")]
    const operator = tuple[0]
    const order = tuple[1]
    const argument0 = Solidity.valueToCode(block, "A", order) || "0"
    const argument1 = Solidity.valueToCode(block, "B", order) || "0"
    const code = argument0 + operator + argument1
    return [code, order]
}

Solidity["math_single"] = function (block) {
    // Math operators with single operand.
    const operator = block.getFieldValue("OP")
    let code
    let arg
    if (operator == "NEG") {
        // Negation is a special case given its different operator precedence.
        arg = Solidity.valueToCode(block, "NUM", Solidity.ORDER_UNARY_NEGATION) || "0"
        if (arg[0] == "-") {
            // --3 is not legal in JS.
            arg = " " + arg
        }
        code = "-" + arg
        return [code, Solidity.ORDER_UNARY_NEGATION]
    }
    if (operator == "SIN" || operator == "COS" || operator == "TAN") {
        arg = Solidity.valueToCode(block, "NUM", Solidity.ORDER_DIVISION) || "0"
    } else {
        arg = Solidity.valueToCode(block, "NUM", Solidity.ORDER_NONE) || "0"
    }
    // First, handle cases which generate values that don't need parentheses
    // wrapping the code.
    switch (operator) {
        case "ABS":
            code = "Math.abs(" + arg + ")"
            break
        case "ROOT":
            code = "Math.sqrt(" + arg + ")"
            break
        case "LN":
            code = "Math.log(" + arg + ")"
            break
        case "EXP":
            code = "Math.exp(" + arg + ")"
            break
        case "POW10":
            code = "Math.pow(10," + arg + ")"
            break
        case "ROUND":
            code = "Math.round(" + arg + ")"
            break
        case "ROUNDUP":
            code = "Math.ceil(" + arg + ")"
            break
        case "ROUNDDOWN":
            code = "Math.floor(" + arg + ")"
            break
        case "SIN":
            code = "Math.sin(" + arg + " / 180 * Math.PI)"
            break
        case "COS":
            code = "Math.cos(" + arg + " / 180 * Math.PI)"
            break
        case "TAN":
            code = "Math.tan(" + arg + " / 180 * Math.PI)"
            break
    }
    if (code) {
        return [code, Solidity.ORDER_FUNCTION_CALL]
    }
    // Second, handle cases which generate values that may need parentheses
    // wrapping the code.
    switch (operator) {
        case "LOG10":
            code = "Math.log(" + arg + ") / Math.log(10)"
            break
        case "ASIN":
            code = "Math.asin(" + arg + ") / Math.PI * 180"
            break
        case "ACOS":
            code = "Math.acos(" + arg + ") / Math.PI * 180"
            break
        case "ATAN":
            code = "Math.atan(" + arg + ") / Math.PI * 180"
            break
        default:
            throw "Unknown math operator: " + operator
    }
    return [code, Solidity.ORDER_DIVISION]
}

Solidity["math_constant"] = function (block) {
    // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
    const CONSTANTS = {
        PI: ["Math.PI", Solidity.ORDER_MEMBER],
        E: ["Math.E", Solidity.ORDER_MEMBER],
        GOLDEN_RATIO: ["(1 + Math.sqrt(5)) / 2", Solidity.ORDER_DIVISION],
        SQRT2: ["Math.SQRT2", Solidity.ORDER_MEMBER],
        SQRT1_2: ["Math.SQRT1_2", Solidity.ORDER_MEMBER],
        INFINITY: ["Infinity", Solidity.ORDER_ATOMIC],
    }
    return CONSTANTS[block.getFieldValue("CONSTANT")]
}

Solidity["math_number_property"] = function (block) {
    // Check if a number is even, odd, prime, whole, positive, or negative
    // or if it is divisible by certain number. Returns true or false.
    const number_to_check =
        Solidity.valueToCode(block, "NUMBER_TO_CHECK", Solidity.ORDER_MODULUS) || "0"
    const dropdown_property = block.getFieldValue("PROPERTY")
    let code
    if (dropdown_property == "PRIME") {
        // Prime is a special case as it is not a one-liner test.
        const functionName = Solidity.provideFunction_("mathIsPrime", [
            "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(n) {",
            "  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods",
            "  if (n == 2 || n == 3) {",
            "    return true;",
            "  }",
            "  // False if n is NaN, negative, is 1, or not whole.",
            "  // And false if n is divisible by 2 or 3.",
            "  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||" + " n % 3 == 0) {",
            "    return false;",
            "  }",
            "  // Check all the numbers of form 6k +/- 1, up to sqrt(n).",
            "  for (let x = 6; x <= Math.sqrt(n) + 1; x += 6) {",
            "    if (n % (x - 1) == 0 || n % (x + 1) == 0) {",
            "      return false;",
            "    }",
            "  }",
            "  return true;",
            "}",
        ])
        code = functionName + "(" + number_to_check + ")"
        return [code, Solidity.ORDER_FUNCTION_CALL]
    }
    switch (dropdown_property) {
        case "EVEN":
            code = number_to_check + " % 2 == 0"
            break
        case "ODD":
            code = number_to_check + " % 2 == 1"
            break
        case "WHOLE":
            code = number_to_check + " % 1 == 0"
            break
        case "POSITIVE":
            code = number_to_check + " > 0"
            break
        case "NEGATIVE":
            code = number_to_check + " < 0"
            break
        case "DIVISIBLE_BY":
            const divisor = Solidity.valueToCode(block, "DIVISOR", Solidity.ORDER_MODULUS) || "0"
            code = number_to_check + " % " + divisor + " == 0"
            break
    }
    return [code, Solidity.ORDER_EQUALITY]
}

Solidity["math_change"] = function (block) {
    // Add to a variable in place.
    const argument0 = Solidity.valueToCode(block, "DELTA", Solidity.ORDER_ADDITION) || "0"
    const varName = Solidity.variableDB_.getName(
        block.getFieldValue("VAR"),
        Blockly.Variables.NAME_TYPE
    )
    return (
        varName +
        " = (typeof " +
        varName +
        " == 'number' ? " +
        varName +
        " : 0) + " +
        argument0 +
        ";\n"
    )
}

// Rounding functions have a single operand.
Solidity["math_round"] = Solidity["math_single"]
// Trigonometry functions have a single operand.
Solidity["math_trig"] = Solidity["math_single"]

Solidity["math_on_list"] = function (block) {
    // Math functions for lists.
    const func = block.getFieldValue("OP")
    let list, code
    switch (func) {
        case "SUM":
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_MEMBER) || "[]"
            code = list + ".reduce(function(x, y) {return x + y;})"
            break
        case "MIN":
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_COMMA) || "[]"
            code = "Math.min.apply(null, " + list + ")"
            break
        case "MAX":
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_COMMA) || "[]"
            code = "Math.max.apply(null, " + list + ")"
            break
        case "AVERAGE":
            // mathMean([null,null,1,3]) == 2.0.
            var functionName = Solidity.provideFunction_("mathMean", [
                "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(myList) {",
                "  return myList.reduce(function(x, y) {return x + y;}) / " + "myList.length;",
                "}",
            ])
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_NONE) || "[]"
            code = functionName + "(" + list + ")"
            break
        case "MEDIAN":
            // mathMedian([null,null,1,3]) == 2.0.
            var functionName = Solidity.provideFunction_("mathMedian", [
                "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(myList) {",
                "  let localList = myList.filter(function (x) " +
                    "{return typeof x == 'number';});",
                "  if (!localList.length) return null;",
                "  localList.sort(function(a, b) {return b - a;});",
                "  if (localList.length % 2 == 0) {",
                "    return (localList[localList.length / 2 - 1] + " +
                    "localList[localList.length / 2]) / 2;",
                "  } else {",
                "    return localList[(localList.length - 1) / 2];",
                "  }",
                "}",
            ])
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_NONE) || "[]"
            code = functionName + "(" + list + ")"
            break
        case "MODE":
            // As a list of numbers can contain more than one mode,
            // the returned result is provided as an array.
            // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
            var functionName = Solidity.provideFunction_("mathModes", [
                "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(values) {",
                "  var modes = [];",
                "  var counts = [];",
                "  var maxCount = 0;",
                "  for (var i = 0; i < values.length; i++) {",
                "    var value = values[i];",
                "    var found = false;",
                "    var thisCount;",
                "    for (var j = 0; j < counts.length; j++) {",
                "      if (counts[j][0] === value) {",
                "        thisCount = ++counts[j][1];",
                "        found = true;",
                "        break;",
                "      }",
                "    }",
                "    if (!found) {",
                "      counts.push([value, 1]);",
                "      thisCount = 1;",
                "    }",
                "    maxCount = Math.max(thisCount, maxCount);",
                "  }",
                "  for (var j = 0; j < counts.length; j++) {",
                "    if (counts[j][1] == maxCount) {",
                "        modes.push(counts[j][0]);",
                "    }",
                "  }",
                "  return modes;",
                "}",
            ])
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_NONE) || "[]"
            code = functionName + "(" + list + ")"
            break
        case "STD_DEV":
            var functionName = Solidity.provideFunction_("mathStandardDeviation", [
                "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(numbers) {",
                "  var n = numbers.length;",
                "  if (!n) return null;",
                "  var mean = numbers.reduce(function(x, y) {return x + y;}) / n;",
                "  var variance = 0;",
                "  for (var j = 0; j < n; j++) {",
                "    variance += Math.pow(numbers[j] - mean, 2);",
                "  }",
                "  variance = variance / n;",
                "  return Math.sqrt(variance);",
                "}",
            ])
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_NONE) || "[]"
            code = functionName + "(" + list + ")"
            break
        case "RANDOM":
            var functionName = Solidity.provideFunction_("mathRandomList", [
                "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(list) {",
                "  var x = Math.floor(Math.random() * list.length);",
                "  return list[x];",
                "}",
            ])
            list = Solidity.valueToCode(block, "LIST", Solidity.ORDER_NONE) || "[]"
            code = functionName + "(" + list + ")"
            break
        default:
            throw "Unknown operator: " + func
    }
    return [code, Solidity.ORDER_FUNCTION_CALL]
}

Solidity["math_modulo"] = function (block) {
    // Remainder computation.
    const argument0 = Solidity.valueToCode(block, "DIVIDEND", Solidity.ORDER_MODULUS) || "0"
    const argument1 = Solidity.valueToCode(block, "DIVISOR", Solidity.ORDER_MODULUS) || "0"
    const code = argument0 + " % " + argument1
    return [code, Solidity.ORDER_MODULUS]
}

Solidity["math_constrain"] = function (block) {
    // Constrain a number between two limits.
    const argument0 = Solidity.valueToCode(block, "VALUE", Solidity.ORDER_COMMA) || "0"
    const argument1 = Solidity.valueToCode(block, "LOW", Solidity.ORDER_COMMA) || "0"
    const argument2 = Solidity.valueToCode(block, "HIGH", Solidity.ORDER_COMMA) || "Infinity"
    const code = "Math.min(Math.max(" + argument0 + ", " + argument1 + "), " + argument2 + ")"
    return [code, Solidity.ORDER_FUNCTION_CALL]
}

Solidity["math_random_int"] = function (block) {
    // Random integer between [X] and [Y].
    const argument0 = Solidity.valueToCode(block, "FROM", Solidity.ORDER_COMMA) || "0"
    const argument1 = Solidity.valueToCode(block, "TO", Solidity.ORDER_COMMA) || "0"
    const functionName = Solidity.provideFunction_("mathRandomInt", [
        "function " + Solidity.FUNCTION_NAME_PLACEHOLDER_ + "(a, b) {",
        "  if (a > b) {",
        "    // Swap a and b to ensure a is smaller.",
        "    var c = a;",
        "    a = b;",
        "    b = c;",
        "  }",
        "  return Math.floor(Math.random() * (b - a + 1) + a);",
        "}",
    ])
    const code = functionName + "(" + argument0 + ", " + argument1 + ")"
    return [code, Solidity.ORDER_FUNCTION_CALL]
}

Solidity["math_random_float"] = function (block) {
    // Random fraction between 0 and 1.
    return ["Math.random()", Solidity.ORDER_FUNCTION_CALL]
}

Solidity["variables_get"] = function (block) {
    // Variable getter.
    const code = Solidity.variableDB_.getName(
        block.getFieldValue("VAR"),
        Blockly.Variables.NAME_TYPE
    )
    return [code, Solidity.ORDER_ATOMIC]
}

Solidity["variables_set"] = function (block) {
    // Variable setter.
    const argument0 = Solidity.valueToCode(block, "VALUE", Solidity.ORDER_ASSIGNMENT) || "0"
    const varName = Solidity.variableDB_.getName(
        block.getFieldValue("VAR"),
        Blockly.Variables.NAME_TYPE
    )
    return varName + " = " + argument0 + ";\n"
}

// Loops

Solidity["controls_repeat_ext"] = function (block) {
    // Repeat n times.
    let repeats = Solidity.valueToCode(block, "TIMES", Solidity.ORDER_ASSIGNMENT) || "0"
    let branch = Solidity.statementToCode(block, "DO")
    branch = Solidity.addLoopTrap(branch, block)
    const loopVar = Solidity.nameDB_.getDistinctName("i", "NameType.VARIABLE")
    let endVar = repeats
    const code = `for (uint ${loopVar} = 0; ${loopVar} < ${endVar}; ${loopVar}++) {\n ${branch}\n}\n`
    return code
}

Solidity["controls_flow_statements"] = function (block) {
    // Flow statements: continue, break.
    let xfix = ""
    if (Solidity.STATEMENT_PREFIX) {
        // Automatic prefix insertion is switched off for this block.  Add manually.
        xfix += Solidity.injectId(Solidity.STATEMENT_PREFIX, block)
    }
    if (Solidity.STATEMENT_SUFFIX) {
        // Inject any statement suffix here since the regular one at the end
        // will not get executed if the break/continue is triggered.
        xfix += Solidity.injectId(Solidity.STATEMENT_SUFFIX, block)
    }
    if (Solidity.STATEMENT_PREFIX) {
        const loop = block.getSurroundLoop()
        if (loop && !loop.suppressPrefixSuffix) {
            // Inject loop's statement prefix here since the regular one at the end
            // of the loop will not get executed if 'continue' is triggered.
            // In the case of 'break', a prefix is needed due to the loop's suffix.
            xfix += Solidity.injectId(Solidity.STATEMENT_PREFIX, loop)
        }
    }
    switch (block.getFieldValue("FLOW")) {
        case "BREAK":
            return xfix + "break;\n"
        case "CONTINUE":
            return xfix + "continue;\n"
    }
    throw Error("Unknown flow statement.")
}

Solidity["controls_whileUntil"] = function (block) {
    // Do while/until loop.
    const until = block.getFieldValue("MODE") === "UNTIL"
    let argument0 =
        Solidity.valueToCode(
            block,
            "BOOL",
            until ? Solidity.ORDER_LOGICAL_NOT : Solidity.ORDER_NONE
        ) || "false"
    let branch = Solidity.statementToCode(block, "DO")
    branch = Solidity.addLoopTrap(branch, block)
    if (until) {
        argument0 = "!" + argument0
    }
    return "while (" + argument0 + ") {\n" + branch + "}\n"
}
