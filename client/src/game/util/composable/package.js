import { Eventable, $Eventable } from "./Eventable";
import { Observable, $Observable } from "./Observable";
import { Reducible, $Reducible } from "./Reducible";
import { Subscribable, $Subscribable } from "./Subscribable";
import { Watchable, $Watchable } from "./Watchable";

/**
 * All entries that begin with "$" are the composable versions of the classes.
 */
export default {
	Eventable,
	Observable,
	Reducible,
	Subscribable,
	Watchable,

	$Eventable,
	$Observable,
	$Reducible,
	$Subscribable,
	$Watchable,
};