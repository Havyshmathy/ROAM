import { useContext } from "react";
import RoamContext from "./roamContextValue";

export function useRoam() {
const value = useContext(RoamContext);

if (!value) {
throw new Error("useRoam must be used inside RoamProvider");
}

return value;
}
