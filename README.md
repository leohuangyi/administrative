# 如果仅需要省市区请使用政府的数据发布来完成这个需求
http://www.mca.gov.cn/article/sj/tjbz/a/2017/1123/11233.html


# 通过搜狗地图webserve api 生成中国的行政区划sql文件(省/市/区/街道)

## 启动命令
```
//切换到项目所在目录
npm install
node index.js

```

## 生成的最终SQL文件为sql/all.sql,生成的表结构如下,-1表示该字段不存在

| id     | name  | fullname | pingyin    | rank | parent |
| -----  |:----: | :----:|:----: | :----:|:----:| ------:|
| 110000  | 浙江   | 浙江省    | zhe,jiang  | 0    | -1     |
| 330100  | 杭州   | 杭州市    | hang,zhou  | 1    | 110000 |
| 330109  | -1     | 萧山区    | -1        | 2     |  330100|

## Notice
+ 几个直辖市被看做省级单位,如重庆的top3级为: 重庆市/南岸区/黄桷垭街道
+ 如果执行node index.js后报错，或没有执行到`写入最终SQL文件成功`，请多执行几次，总会成功哒
+ 如果多次执行仍失败,可能是达到了搜狗地图的API配额,请将index.js的Api_key替换成你自己的
