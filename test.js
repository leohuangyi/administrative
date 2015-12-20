/**
 * Created by leo on 15/12/19.
 */
var str = '{{name}} is {{value}}';
var matchs =  str.match(/\{\{([a-z]*)\}\}/gi);
console.log();

console.log(matchs[1].replace(/[\{\{,\}\}]/gi,""));