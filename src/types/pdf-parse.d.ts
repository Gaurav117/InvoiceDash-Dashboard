declare module 'pdf-parse' {
    function PDFParse(dataBuffer: Buffer, options?: any): Promise<{
        text: string;
        numpages: number;
        numrender: number;
        info: any;
        metadata: any;
        version: string;
    }>;
    export = PDFParse;
}
