export default class Symbols 
{
    public static readonly DEF: string = "def";
    public static readonly LET: string = "let";
    public static readonly GET_PAGE: string = "get-page";
    public static readonly TO_TREE: string = "to-tree";
    
    public static SymbolListing: Array<string> = [ 
        Symbols.DEF,
        Symbols.LET,
        Symbols.GET_PAGE,
        Symbols.TO_TREE
    ];

}