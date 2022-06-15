import Registrar, { Name as RegistryName } from "./Registrar";
import Position, { Name as PositionName }  from "./Position";

export const Components = {
	[ RegistryName ]: Registrar,
	[ PositionName ]: Position
};

export default Components;