import chai from 'chai';
import { readFileSync } from 'fs';
// var match = require('syntaxhighlighter-match');

import BoxLangBrush from './brush-boxlang.js';

const expect = chai.expect;
const sample = readFileSync(`${__dirname}/Sample.bx`, 'utf8');

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
  let instance = null;

  before(function() {
    instance = new BoxLangBrush();
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

  describe('BoxLang Variable Scopes', function() {
    it('can identify all BoxLang variable scopes', function() {
      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      expect(scopeRegex).to.exist;

      // List of all BoxLang variable scopes
      var scopes = [
        'application', 'arguments', 'attributes', 'caller', 'client', 'cgi', 
        'form', 'local', 'request', 'server', 'session', 'url', 'thread', 'variables'
      ];

      scopes.forEach(function(scope) {
        scopeRegex.regex.lastIndex = 0;
        expect(scopeRegex.regex.test(scope)).to.be.true;
      });
    });

    it('can highlight variable scope usage in code', function() {
      var testCode = `
        function testScopes() {
          var local.name = "BoxLang";
          variables.count = 10;
          application.settings = {};
          session.user = "testUser";
          request.data = [];
          form.email = "test@example.com";
          url.redirect = "home";
          client.preferences = {};
          server.config = "production";
          cgi.server_name = "localhost";
          thread.result = "complete";
          arguments.first = "value1";
          attributes.required = true;
          caller.context = this;
        }
      `;

      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      var matches = testCode.match(scopeRegex.regex);
      expect(matches).to.not.be.null;
      expect(matches.length).to.be.above(10); // Should match multiple scope references
    });

    it('can differentiate scope names from similar words', function() {
      var testCode = `
        // These should NOT match as scopes
        var myApplication = "test";
        var variablesName = "test";
        var sessionManager = "test";
        var requestHandler = "test";
        
        // These SHOULD match as scopes
        application.name = "MyApp";
        variables.count = 5;
        session.id = "abc123";
        request.method = "GET";
      `;

      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      var matches = testCode.match(scopeRegex.regex);
      expect(matches).to.not.be.null;
      // Should only match the actual scope names, not the compound words
      expect(matches).to.include('application');
      expect(matches).to.include('variables');
      expect(matches).to.include('session');
      expect(matches).to.include('request');
      expect(matches).to.not.include('myApplication');
      expect(matches).to.not.include('variablesName');
    });

    it('can handle scope references in different contexts', function() {
      var testCode = `
        // Function parameters using scopes
        function myFunction(arguments.data) {
          // Variable assignments
          local.temp = arguments.data;
          variables.result = process(local.temp);
          
          // Conditionals
          if (session.authenticated) {
            application.users[session.userId] = variables.result;
          }
          
          // Return statements
          return {
            "data": variables.result,
            "user": session.userId,
            "app": application.name
          };
        }
        
        // Component property
        property name="appData" type="struct" default="#application.config#";
        
        // Direct access
        var userData = session.user;
        var formData = form.contactInfo;
        var serverInfo = server.environment;
      `;

      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      var matches = testCode.match(scopeRegex.regex);
      expect(matches).to.not.be.null;
      expect(matches.length).to.be.above(8); // Should find multiple scope references in various contexts
    });

    it('can handle scopes in BoxLang template syntax', function() {
      var testCode = `
        <bx:output>
          #variables.title#
          #session.userName#
          #application.version#
        </bx:output>
        
        <bx:if test="#session.isLoggedIn#">
          Welcome back, #session.userName#!
          <bx:set local.greeting = "Hello " & session.userName>
        </bx:if>
        
        <bx:loop query="variables.userQuery">
          #variables.userQuery.name#
        </bx:loop>
      `;

      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      var matches = testCode.match(scopeRegex.regex);
      expect(matches).to.not.be.null;
      expect(matches).to.include('variables');
      expect(matches).to.include('session');
      expect(matches).to.include('application');
      expect(matches).to.include('local');
    });

    it('validates scope regex pattern boundaries', function() {
      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      // Test that scope names must be whole words (word boundaries)
      var testCases = [
        { code: 'application.test', shouldMatch: true },
        { code: 'myapplication.test', shouldMatch: false },
        { code: 'applicationTest', shouldMatch: false },
        { code: 'session.user', shouldMatch: true },
        { code: 'newsession.user', shouldMatch: false },
        { code: 'sessionId', shouldMatch: false },
        { code: 'variables.count', shouldMatch: true },
        { code: 'myvariables.count', shouldMatch: false }
      ];

      testCases.forEach(function(testCase) {
        scopeRegex.regex.lastIndex = 0;
        var matches = testCase.code.match(scopeRegex.regex);
        
        if (testCase.shouldMatch) {
          expect(matches, `"${testCase.code}" should match scope pattern`).to.not.be.null;
        } else {
          expect(matches, `"${testCase.code}" should NOT match scope pattern`).to.be.null;
        }
      });
    });

    it('can handle all scope types in a comprehensive example', function() {
      var comprehensiveCode = `
        /**
         * Comprehensive BoxLang scope usage example
         */
        component {
          variables.componentName = "ScopeDemo";
          
          function demonstrateScopes(arguments.data) {
            // Local scope
            local.startTime = now();
            
            // Variables scope (component instance)
            variables.lastAccessed = local.startTime;
            
            // Arguments scope
            local.inputData = arguments.data;
            
            // Application scope
            if (!structKeyExists(application, "initialized")) {
              application.initialized = true;
              application.startTime = local.startTime;
            }
            
            // Session scope
            if (structKeyExists(session, "userID")) {
              session.lastActivity = local.startTime;
            }
            
            // Request scope
            request.processedBy = variables.componentName;
            request.timestamp = local.startTime;
            
            // Form scope (if form submission)
            if (structKeyExists(form, "action")) {
              local.formAction = form.action;
            }
            
            // URL scope
            if (structKeyExists(url, "debug")) {
              local.debugMode = url.debug;
            }
            
            // Client scope (persistent client variables)
            client.visits = (structKeyExists(client, "visits") ? client.visits + 1 : 1);
            
            // Server scope
            local.serverInfo = {
              "name": server.os.name,
              "version": server.boxlang.version
            };
            
            // CGI scope
            local.requestInfo = {
              "method": cgi.request_method,
              "host": cgi.server_name,
              "userAgent": cgi.http_user_agent
            };
            
            // Thread scope (when in thread context)
            thread.results = local.requestInfo;
            
            // Attributes scope (for custom components)
            if (structKeyExists(attributes, "mode")) {
              local.processingMode = attributes.mode;
            }
            
            // Caller scope (accessing calling template's variables)
            caller.processedData = local.inputData;
            
            return {
              "success": true,
              "data": local.inputData,
              "timestamp": local.startTime
            };
          }
        }
      `;

      var regexList = instance.regexList;
      var scopeRegex = regexList.find(rule => rule.css === 'color7');
      
      var matches = comprehensiveCode.match(scopeRegex.regex);
      expect(matches).to.not.be.null;
      
      // Verify all scope types are found
      var expectedScopes = [
        'variables', 'local', 'arguments', 'application', 'session', 
        'request', 'form', 'url', 'client', 'server', 'cgi', 
        'thread', 'attributes', 'caller'
      ];
      
      expectedScopes.forEach(function(scope) {
        expect(matches, `Should find "${scope}" scope in comprehensive example`).to.include(scope);
      });
      
      // Should find multiple instances of commonly used scopes
      expect(matches.filter(m => m === 'local').length).to.be.above(5);
      expect(matches.filter(m => m === 'variables').length).to.be.above(1);
    });
  });
});

console.log('All tests passed!');