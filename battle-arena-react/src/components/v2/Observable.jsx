import React, { useState } from "react";
import { Grid, Table, Input } from "semantic-ui-react";

export default function Observable(props) {
    const { observable } = props;
    const [ isEditMode, setIsEditMode ] = useState();

    const data = JSON.parse(JSON.stringify(observable.toData()));

    function toDataArray(data, prop = "$") {
        let obj = {};
        for(let [ key, value ] of Object.entries(data)) {
            const dot = `${ prop }.${ key }`;
            if(typeof value === "object") {
                obj[ key ] = (
                    <Grid key={ dot }>{                        
                        toDataArray(value, dot).map(([ key, value ]) => (
                            <Grid.Row key={ key }>
                                <Grid.Column>{ key }</Grid.Column>
                                <Grid.Column>{ value }</Grid.Column>
                            </Grid.Row>
                        ))
                    }</Grid>
                );
            } else {
                obj[ key ] = (
                    <div key={ dot }>{ value }</div>
                );
            }
        }

        return Object.entries(obj);
    }

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Key</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            
            <Table.Body>
                <Table.Row>
                    <Table.Cell>__id</Table.Cell>
                    <Table.Cell>{ observable.__id }</Table.Cell>
                </Table.Row>
                {
                    toDataArray(data).map(([ key, jsx ]) => (
                        <Table.Row key={ key }>
                            <Table.Cell key={ `${ key }-1` }>{ key }</Table.Cell>

                            {
                                isEditMode === key ? (
                                    <Table.Cell
                                        key={ `${ key }-2` }
                                        onClick={ e => {
                                            setIsEditMode(null) ;
                                        }}
                                        onKeyPress={ e => {
                                            if(e.which === 13) {
                                                setIsEditMode(null) ;
                                            }
                                        }}
                                    >
                                        <Input
                                            defaultValue={ observable[ key ] }
                                            onChange={ e => observable[ key ] = e.target.value }
                                        />
                                    </Table.Cell>
                                ) : (
                                    <Table.Cell
                                        key={ `${ key }-2` }
                                        onClick={ e => {
                                            setIsEditMode(key);
                                        }}
                                    >{ jsx }</Table.Cell>
                                )
                            }
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    )
};