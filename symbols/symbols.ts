export default class Symbols 
{
    public static readonly DEF: string = "def!";
    public static readonly LET: string = "let";
    public static readonly GET_PAGE: string = "get-page";
    public static readonly TO_TREE: string = "to-tree";
    public static readonly GET_ENDPOINT: string = "get-endpoint";
    public static readonly GET_TAG: string = "get-tag";
    public static readonly X_FILE: string = "x-file";
    public static readonly IF: string = "if";
    public static readonly FN: string = "fn*";
    public static readonly HOT_REFRESH: string = "reload";
    public static readonly FMAP: string = "fmap";

    public static SymbolListing: Array<string> = [ 
        Symbols.DEF,
        Symbols.LET,
        Symbols.GET_PAGE,
        Symbols.TO_TREE,
        Symbols.GET_ENDPOINT,
        Symbols.GET_TAG,
        Symbols.X_FILE,
        Symbols.FN,
        Symbols.IF,
        Symbols.HOT_REFRESH,
        Symbols.FMAP,
    ];
}