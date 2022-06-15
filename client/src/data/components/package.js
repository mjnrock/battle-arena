import Registry, { Name as RegistryName } from "./Registry";
import Position, { Name as PositionName }  from "./Position";

export const Components = {
	[ RegistryName ]: Registry,
	[ PositionName ]: Position
};

export default Components;