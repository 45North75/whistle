import axios from "axios";
import { MalJSON, MalString, MalType } from "../types/types";

export async function getEndpoint(url: MalType): Promise<MalJSON>
{
    url = url as MalString;
    const data = await axios.get(url.v);
    return new MalJSON(data.data);
}