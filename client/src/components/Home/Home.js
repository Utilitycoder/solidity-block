import React, { useState, useEffect }from "react"
import { getContracts } from '../../actions/contracts';
import { useDispatch } from "react-redux";
import Contracts from '../Contracts/contracts'
import BlocklyComponent, { Block, Category, Sep } from "../Blockly"

import "../../blockly/blocks/customblocks"
import "../../blockly/generator/generator"

function Home() {
    const [currentId, setCurrentId] = useState(0);
    const dispatch = useDispatch();
  
    useEffect(() => {
      dispatch(getContracts());
    }, [currentId, dispatch]);

    return (
        <div className="App">
            <BlocklyComponent
                media={"media/"}
                scrollbars={true}
                collapse={true}
                comments={true}
                disable={true}
                maxBlocks={Infinity}
                trashcan={true}
                horizontalLayout={false}
                toolboxPosition={"start"}
                css={true}
                rtl={false}
                sounds={true}
                oneBasedIndex={true}
                zoom={{
                    controls: true,
                }}
                grid={{
                    spacing: 25,
                    length: 3,
                    colour: "#ccc",
                    snap: true,
                }}
                initialXml={
                    '<xml><Block type="contract" deletable="false" movable="false"></Block></xml>'
                }
            >
                <Category name="Import Blocks" colour="#79419c">
                    <Block type="import" />
                    <Block type="importinherit" />
                </Category>
                <Category name="Contract State" colour="#5ba580">
                    <Category name="Value Types" colour="#5ba580">
                        <Block type="state" />
                        <Block type="contract_state" />
                        <Block type="contract_state_get" />
                        <Block type="contract_state_set" />
                    </Category>
                    <Category name="Reference Types" colour="#5ba580">
                        <Block type="struct" />
                        <Block type="enum" />
                        <Block type="mapping" />
                        <Block type="mapping_set" />
                        <Block type="mapping_get" />
                        <Block type="nested_mapping" />
                        <Block type="nested_mapping_set" />
                        <Block type="nested_mapping_get" />
                    </Category>
                    <Category name="Events" colour="#5ba580">
                        <Block type="event" />
                        <Block type="event_parameter" />
                        <Block type="event_param_nonindex" />
                        <Block type="event_get" />
                    </Category>
                </Category>
                <Category name="Global Variables" colour="#d9b428">
                    <Category name="Block Variables" colour="#193cc6"> 
                        <Block type="blockvariables" />
                    </Category>
                    <Category name="Tansaction Variables" colour="#9bb4a6"> 
                        <Block type="transactionvariables" />
                    </Category>
                    <Category name="Cryptography Variables" colour="#090979"> 
                        <Block type="cryptographyvariables" />
                    </Category>
                    <Category name="ABI Encode and Decode" colour="#c61919"> 
                        <Block type="encodevariables" />
                    </Category>      
                </Category>
                <Sep />
                <Category name="Contract Constructor" colour="#9c415c">
                    <Block type="contract_ctor" />
                </Category>
                <Category name="Modifier" colour="#9bb4a6">
                    <Block type="modifier" />
                    <Block type="modifier_call" />
                </Category>
                <Category name="Contract Functions" colour="#79419c">
                    <Block type="contract_function" />
                    <Block type="contract_function_parameter" />
                    <Block type="contract_function_parameter_memory" />
                    <Block type="contract_function_parameter_get" />
                    <Block type="contract_function_call" />
                    <Block type="no_parameter_function_call" />
                    <Block type="get_function_call" />
                    <Block type="function_argument" />
                    <Block type="returns" />
                </Category>
                <Sep />
                <Category name="Logic and Math" colour="#5C81A6">
                    <Block type="boolean" />
                    <Block type="logic_compare" />
                    <Block type="logic_operation" />
                    <Block type="controls_ifelse" />
                    <Block type="controls_if" />
                    <Block type="math_number" />
                    <Block type="math_single" />
                    <Block type="math_arithmetic" />
                </Category>
                <Category name="Error-Handling" colour="#9c7441">
                    <Block type="assert" />
                    <Block type="require" />
                    <Block type="revert" />
                </Category>
                <Category name="Control Statements" colour="#9c415c">
                    <Block type="controls_repeat_ext" />
                    <Block type="controls_flow_statements" />
                    <Block type="controls_whileUntil" />
                </Category>
                <Sep />
                <Category name="Operators" colour="#79419c">
                    <Block type="bitwise" />
                </Category>
                <Category name="General Purpose" colour="#5ba580">
                        <Block type="parenthesis" />
                        <Block type="parenthesisText" />
                        <Block type="inputText" />
                        <Block type="space" />
                        <Block type="comment" />
                </Category>
            </BlocklyComponent>
            <Contracts setCurrentId={setCurrentId} />
        </div>
    )
}

export default Home