import { Grid, Table } from "semantic-ui-react";

export default function Observable(props) {
    const { observable } = props;

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
                    toDataArray(data).map(([ key, value ]) => (
                        <Table.Row key={ key }>
                            <Table.Cell key={ `${ key }-1` }>{ key }</Table.Cell>
                            <Table.Cell key={ `${ key }-2` }>{ value }</Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    )
};