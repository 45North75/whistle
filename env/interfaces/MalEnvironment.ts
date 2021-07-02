import { MalFunction } from "../../types/types";

export default interface MalEnvironment {
    [key: string]: MalFunction;
}