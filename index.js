/**
 * Created by leo on 15/12/19.
 */
var co = require('co');
var fs = require('fs');
var os = require('os');
var path = require('path');
var request = require('request');
var Api_key = 'ZKTBZ-ETGH3-UP43K-34YEJ-DVIYF-AFFXP';
var tableName = 'administrative';   //存储数据的表名

try{
    co(function*(){
        var provinces = yield getProvinces;
        var citys = yield getCitys(provinces);
        var districts = yield getDistricts(citys);

        console.log('省:'+provinces.length);
        console.log('市:'+citys.length);
        console.log('区:'+districts.length);

        var tableSql = fs.readFileSync(path.join(__dirname,'sql/table.sql'));
        var provincesSql = fs.readFileSync(path.join(__dirname,'sql/provinces.sql'));
        var citysSql = fs.readFileSync(path.join(__dirname,'sql/citys.sql'));
        var districtsSql = fs.readFileSync(path.join(__dirname,'sql/districts.sql'));
        yield writeFile(path.join(__dirname,'sql/all.sql'), tableSql +os.EOL
            + provincesSql + os.EOL + citysSql + os.EOL + districtsSql,'写入最终SQL文件成功');

    });
}catch (e){
    console.log(e.message);
}
/*
    将抓取到得数据转换成INSERT SQL语句
 */
function data2sql(data, rank, parent){
    switch (rank){
        case 0:
            //省
            data.rank = 0;
            data.parent = -1;
            break;
        case 1:
            data.rank = 1;
            data.parent = parent;
            //市
            break;
        case 2:
            //区
            data.rank = 2;
            data.name = -1;
            data.pinyin = -1;
            data.parent = parent;
            break;
    }

    var insertSql = 'INSERT INTO `' + tableName + '`'
        + ' (`id`, `name`, `fullname`, `pinyin`, `rank`, `parent`) VALUES'
        + " ('{{id}}', '{{name}}', '{{fullname}}', '{{pinyin}}', {{rank}}, '{{parent}}')";

    return dataTemplate(insertSql, data);
};
/*
    将省/市/区对应的SQL语句写入到文件中
 */
function* writeFile(filename, str, info){
    return new Promise(function(resolve, reject){
        fs.writeFile(filename, str, function (err) {
            if (err) throw err;
            console.log(info);
            resolve(1);
        });
    });
};
/**
 一个用作js模板替换的代码
 template格式和数组格式如下
 var template = "<div><h1>{{title}}</h1><p>{{content}}</p></div>";
 var data = {title: 'a', content: 'b'};
 只需要数据格式对应
 */
function dataTemplate(template,data){
    var matchs = template.match(/\{\{[a-zA-Z]+\}\}/gi);
    for(var j = 0 ; j < matchs.length ;j++){
        var key = matchs[j].replace(/[\{\{,\}\}]/gi,"");
        template = template.replace(matchs[j], data[key]);
    }
    return template;
};

function * getProvinces(){
    //全国的省
    var provinces = [];
    provinces = yield function*() {
        return new Promise(function (resolve, reject) {
            request(
                'http://apis.map.qq.com/ws/district/v1/list?key=' + Api_key,
                function (error, response, body) {
                    if (error || 200 != response.statusCode) throw new Error('请求省出错');
                    var body = JSON.parse(body);
                    if(body.status != 0){
                        throw new Error('请求省出错');
                    }
                    resolve(body.result[0]);
                }
            );
            console.log('请求中......');
        })
    };

    var provincesSql_arr = [];
    provinces.forEach(function(province){
        provincesSql_arr.push(data2sql(province, 0))
    });
    yield writeFile(path.join(__dirname, 'sql/provinces.sql'), provincesSql_arr.join(';' + os.EOL) + ';', '写入省SQL成功');
    return provinces;
}
function * getCitys(provinces){
    var citysSql_arr = [];
    var allCitys  = [];
    for(var i = 0; i< provinces.length ; i++){
        var citys = yield function*() {
            return new Promise(function (resolve, reject) {
                function requestData(){
                    console.log('正在请求'+provinces[i].fullname+'对应的市');
                    request(
                        'http://apis.map.qq.com/ws/district/v1/getchildren?'
                        +'&id=' + provinces[i].id
                        +'&key=' + Api_key,
                        function (error, response, body) {
                            if (error || 200 != response.statusCode) throw new Error('请求市出错');
                            var body = JSON.parse(body);
                            if(body.status == 0){
                                resolve(body.result[0]);
                            }else{
                                //无限请求,直至取到
                                requestData();
                            }
                        }
                    );
                }
                requestData();
            })
        };
        citys.forEach(function(city){
            citysSql_arr.push(data2sql(city,1,provinces[i].id));
        });
        allCitys = allCitys.concat(citys);
    }
    yield writeFile(path.join(__dirname, 'sql/citys.sql'), citysSql_arr.join(';' + os.EOL) + ';', '写入市SQL成功');
    return allCitys;
}
function * getDistricts(citys){
    var districtsSql_arr = [];
    var allDistricts  = [];
    for(var i = 0; i< citys.length ; i++){
        var districts = yield function*() {
            return new Promise(function (resolve, reject) {
                function requestData(){
                    console.log('正在请求'+citys[i].fullname+'对应的区');
                    request(
                        'http://apis.map.qq.com/ws/district/v1/getchildren?'
                        +'&id=' + citys[i].id
                        +'&key=' + Api_key,
                        function (error, response, body) {
                            if (error || 200 != response.statusCode) throw new Error('请求区出错');
                            var body = JSON.parse(body);
                            if(body.status == 0){
                                resolve(body.result[0]);
                            }else{
                                //无限请求,直至取到
                                requestData();
                            }
                        }
                    );
                }
                requestData();
            })
        };
        districts.forEach(function(district){
            districtsSql_arr.push(data2sql(district,2,citys[i].id));
        });
        allDistricts = allDistricts.concat(districts);
    }
    yield writeFile(path.join(__dirname, 'sql/districts.sql'), districtsSql_arr.join(';' + os.EOL) + ';', '写入区SQL成功');
    return allDistricts;
}


