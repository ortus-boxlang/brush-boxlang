var chai = require('chai');
var expect = chai.expect;
// var match = require('syntaxhighlighter-match');

var Brush = require('./brush-boxlang.js').Brush;
var sample = require('fs').readFileSync(`${__dirname}/Sample.bx`, 'utf8');

console.log('Running tests...');

function describe(name, fn) {
  console.log('Testing:', name);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log('  ✓', name);
  } catch (e) {
    console.log('  ✗', name, ':', e.message);
    process.exit(1);
  }
}

function before(fn) {
  fn();
}

describe('brush-boxlang', function() {
  var instance = null;

  before(function() {
    instance = new Brush();
  });

  it('has populated code sample', function() {
    expect(sample).to.not.match(/^Populate/);
  });

  describe('instance', function() {
    it('has `regexList`', function() {
      expect(instance).to.have.property('regexList');
    });

    it('has regex rules for highlighting', function() {
      expect(instance.regexList).to.be.an('array');
      expect(instance.regexList.length).to.be.above(0);
    });

    it('can identify keywords', function() {
      var regexList = instance.regexList;
      var keywordRegex = regexList.filter(rule => rule.css === 'keyword');
      expect(keywordRegex.length).to.be.above(0);

      // Test the language keywords regex (should be the third one)
      var languageKeywordRegex = keywordRegex.find(rule =>
        rule.regex.toString().includes('abstract') &&
        rule.regex.toString().includes('function') &&
        rule.regex.toString().includes('if')
      );

      expect(languageKeywordRegex).to.exist;

      // Test that it now properly matches keywords
      languageKeywordRegex.regex.lastIndex = 0;
      expect(languageKeywordRegex.regex.test('function')).to.be.true;

      languageKeywordRegex.regex.lastIndex = 0;
      expect(languageKeywordRegex.regex.test('if')).to.be.true;

      languageKeywordRegex.regex.lastIndex = 0;
      expect(languageKeywordRegex.regex.test('return')).to.be.true;
    });

    it('can identify strings', function() {
      var regexList = instance.regexList;
      var stringRegex = regexList.find(rule => rule.css === 'string');
      expect(stringRegex).to.exist;

      // Test that the string regex matches quoted strings
      var testString = 'var name = "Hello World";';
      var matches = testString.match(stringRegex.regex);
      expect(matches).to.not.be.null;
    });

    it('can identify comments', function() {
      var regexList = instance.regexList;
      var commentRegex = regexList.find(rule => rule.css === 'comments');
      expect(commentRegex).to.exist;

      // Test that the comment regex matches single line comments
      var testComment = '// This is a comment';
      var matches = testComment.match(commentRegex.regex);
      expect(matches).to.not.be.null;
    });
  });

  // describe('parsing', function() {
  //   var matches = null;

  //   before(function() {
  //     matches = match.applyRegexList(sample, instance.regexList);
  //   });

  //   it('can parse', function() {
  //     expect(matches).to.have.length.above(0);
  //   });
  // });

  describe('comprehensive functionality', function() {
    it('can handle real BoxLang code', function() {
      var testCode = `
        function test() {
          if (true) {
            var name = "BoxLang";
            return name;
          }
        }
      `;

      // Test that various regex patterns can identify their respective elements
      var regexList = instance.regexList;
      var foundMatches = {
        keywords: 0,
        strings: 0,
        comments: 0
      };

      regexList.forEach(function(rule) {
        var matches = testCode.match(rule.regex);
        if (matches) {
          if (rule.css === 'keyword') foundMatches.keywords += matches.length;
          if (rule.css === 'string') foundMatches.strings += matches.length;
          if (rule.css === 'comments') foundMatches.comments += matches.length;
        }
      });

      expect(foundMatches.keywords).to.be.above(0);  // Should find keywords like 'function', 'if', 'var', 'return'
      expect(foundMatches.strings).to.be.above(0);   // Should find the "BoxLang" string
      expect(instance.regexList.length).to.be.above(10); // Should have many rules
    });
  });
});

console.log('All tests passed!');