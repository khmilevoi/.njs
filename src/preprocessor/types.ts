export interface NjsPreprocessorHandler {
    transform(source: string, dir: string): Promise<string>;
}

export interface NjsPreprocessor {
    run(source: string, dirs: string): Promise<string>;
}
