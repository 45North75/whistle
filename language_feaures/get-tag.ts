import axios from "axios";
import { MalAtom, MalElements, MalJSON, MalKeyword, MalPage, MalString, MalType } from "../types/types";

export async function getTag(page: MalType, atom: MalType): Promise<MalElements>
{
    page = page as MalPage;
    atom = atom as MalKeyword;
    let payload = [];
    page.v(atom.v).each(function(i, element) {
        payload.push(element);
    });
    return new MalElements(payload);
}