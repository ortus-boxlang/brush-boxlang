import BoxLangBrush from './brush-boxlang.js';

console.log('✓ Brush loaded successfully');
console.log('✓ Aliases:', BoxLangBrush.aliases);

const instance = new BoxLangBrush();
console.log('✓ Instance created');
console.log('✓ Regex list length:', instance.regexList.length);

console.log('\nBrush is ready to use with SyntaxHighlighter!');
