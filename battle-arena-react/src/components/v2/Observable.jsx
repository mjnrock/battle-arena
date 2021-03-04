import React, { useState } from "react";
import { Grid, Table, Input } from "semantic-ui-react";

import AgencyObservable from "./../../lib/v2/util/Observable";

//TODO  Pass the edit functionality to any nested <Observable>

export default function Observable(props) {
    const { observable } = props;
    const [ isEditMode, setIsEditMode ] = useState();

    const data = JSON.parse(JSON.stringify(observable.toData()));

    function toDataArray(data, prop = "$") {
        let obj = {};
        for(let [ key, value ] of Object.entries(data)) {
            const dot = `${ prop }.${ key }`;
            if(observable[ dot ] instanceof AgencyObservable) {
                obj[ key ] = (
                    <Observable observable={ observable[ dot ] } />
                );
            } else if(typeof value === "object") {
                obj[ key ] = (
                    <Grid key={ dot } celled padded>{                        
                        toDataArray(value, dot).map(([ key, value ]) => (
                            <Grid.Row key={ key }>
                                <Grid.Column width={ 2 }>{ key }</Grid.Column>
                                <Grid.Column width={ 14 }>{ value }</Grid.Column>
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

    function objectToEditJsx(obj, prop, dot) {
        if(!dot) {
            dot = `$`;
        }

        const dotprop = `${ dot }.${ prop }`;
        if(typeof obj[ prop ] === "object") {
            let jsx = [];
            for(let [ key, value ] of Object.entries(obj[ prop ])) {
                jsx.push((
                    <Grid key={ key } celled>
                        <Grid.Row key={ key }>
                            <Grid.Column width={ 2 }>{ key }</Grid.Column>
                            <Grid.Column width={ 14 }>{
                                objectToEditJsx(value, key, dotprop)
                            }</Grid.Column>
                        </Grid.Row>
                    </Grid>
                ));
            }

            return jsx;
        }
        
        if(!isNaN(parseFloat(observable[ dotprop ])) && isFinite(observable[ dotprop ])) {
            return (
                <Input
                    type="number"
                    defaultValue={ observable[ dotprop ] }
                    onChange={ e => observable[ dotprop ] = parseFloat(e.target.value) }
                />
            );
        }

        return (
            <Input
                type="text"
                defaultValue={ observable[ dotprop ] }
                onChange={ e => observable[ dotprop ] = e.target.value }
            />
        );
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
                                        onBlur={ e => {
                                            setIsEditMode(null) ;
                                        }}
                                        onKeyPress={ e => {
                                            if(e.which === 13) {
                                                setIsEditMode(null) ;
                                            }
                                        }}
                                    >
                                        {
                                            objectToEditJsx(data, key)
                                        }
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