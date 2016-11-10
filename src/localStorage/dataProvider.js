

/*
[{
    session:xxxxxxxx,
    updataTime:12345,
    latestMessage: 'HELLO'
    messages:[{
        content:'heelo'
    }]
}]

*/


var DataProvider = function (){
    this.dataMap = {};
};


// 保存消息
DataProvider.prototype.saveMessage = function (message) {
    // message
};

// 获取当前对话session列表
DataProvider.prototype.getSessionList = function () {

};

// 获取历史对话session列表
DataProvider.prototype.getHistorySessionList = function (message) {

};

// 修改session信息
DataProvider.prototype.updateSession = function (message) {

};

// 获取session聊天记录
DataProvider.prototype.getHistoryMessages = function (message) {

};

// 获取用户信息
DataProvider.prototype.getUserInfo = function (message) {

};

// 修改用户信息
DataProvider.prototype.updateUserInfo = function (message) {

};

medule.exports = DataProvider;
