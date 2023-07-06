import React from "react"
import "./BlocklyComponent.css"
import { useEffect, useRef, useState } from "react"

import TextArea from '../TextArea/textarea'
import Blockly from "blockly/core"
import { Solidity } from "../../blockly/generator/generator"
import locale from "blockly/msg/en"
import "blockly/blocks"

Blockly.setLocale(locale)

function BlocklyComponent(props) {
    const [solidityCode, setSolidityCode] = useState("")
    const [currentId, setCurrentId] = useState(0)
    const blocklyDiv = useRef()
    const toolbox = useRef()
    let primaryWorkspace = useRef()
      
    
    const generateCode = () => {
        try {
            var code = Solidity.workspaceToCode(primaryWorkspace.current)
            setSolidityCode(code)
        } catch (e) {
            setSolidityCode(e)
        }
    }

    useEffect(() => {
        const { initialXml, children, ...rest } = props
        primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
            toolbox: toolbox.current,
            ...rest,
        })

        if (initialXml) {
            Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(initialXml), primaryWorkspace.current)
        }

        generateCode()

    }, [primaryWorkspace, toolbox, blocklyDiv, props])

    return (
        <>
            <div >
            <div ref={blocklyDiv} className="fill-height" />
            <div ref={toolbox}>
                {props.children}
            </div >
                <div className="blockly-flex">
                <button
                className="convertBtn" 
                onClick={generateCode}>
                    Convert Block To Code
                </button>
                </div>
            </div>
            <TextArea solidityCode={solidityCode} currentId={currentId} setCurrentId={setCurrentId}/>
        </>
    )
}

export default BlocklyComponent
