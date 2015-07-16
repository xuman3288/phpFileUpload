/**
 * Created by xuman on 15-7-14.
 */
var FileUpload = {

    //非分片发送文件
    sendFile: function (url, file, formdata, onSuccess, onError) {
        var me = this;
        try {
            var xhr = new XMLHttpRequest();
        } catch (e) {
            var xhr = ActiveXObject("Msxml12.XMLHTTP");
        }
        // 上传进度中
        xhr.upload.addEventListener("progress", function (e) {
            var per = Math.floor(e.loaded/ e.total * 100);
            me.progress(per);

        }, false);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var retText = xhr.responseText;
                    var ret = JSON.parse(retText);
                    onSuccess && onSuccess(ret);
                } else {
                    onError && onError();
                }
            }
        }
        xhr.open("POST", url, true);
        xhr.setRequestHeader("X-Request-With", "XMLHttpRequest");
        var fd = new FormData();
        fd.append("file", file);
        if (formdata) {
            for (var key in formdata) {
                fd.append(key, formdata[key]);
            }
        }
        xhr.send(fd);

    },

    splitSize: 1024 * 2000,
    //分片发送文件
    splitSend: function (file) {
        var me = this, size = file.size, name = file.name, type = file.type || "";
        var fileId = (file.lastModifiedDate + "").replace(/\W/g, '') + size + type.replace(/\W/g, '');
        var start = localStorage[fileId] * 1 || 0;
        var funcSendPiece = function () {
            var data = {
                total: size,
                start: start,
                fileId: fileId,
                fileName : name,
                isComplete : (start + me.splitSize > size) * 1
            };

            me.sendPiece(
                '',
                file.slice(start, start + me.splitSize),
                {
                    start : start,
                    size : size
                },
                data,
                function (ret) {
                    if (ret.code == 0) {
                        if (start + me.splitSize >= size) {
                            //over
                            localStorage.removeItem(fileId)
                        } else {
                            start = start + me.splitSize;
                            localStorage.setItem(fileId, start + "");
                            funcSendPiece();
                        }
                    }
                }
            );
        }
        funcSendPiece();
    },
    //发送文件片段
    sendPiece: function (url, file, fileInfo, formdata, onSuccess, onError) {
        var me = this;
        try {
            var xhr = new XMLHttpRequest();
        } catch (e) {
            var xhr = ActiveXObject("Msxml12.XMLHTTP");
        }
        // 上传进度中
        xhr.upload.addEventListener("progress", function (e) {
            var per = Math.floor((fileInfo.start + e.loaded/ e.total * file.size)/fileInfo.size * 100);
            me.progress(per);

        }, false);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var retText = xhr.responseText;
                    var ret = JSON.parse(retText);
                    onSuccess && onSuccess(ret);
                } else {
                    onError && onError();
                }
            }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("X-Request-With", "XMLHttpRequest");
        var fd = new FormData();
        fd.append("file", file);
        if (formdata) {
            for (var key in formdata) {
                fd.append(key, formdata[key]);
            }
        }
        xhr.send(fd);

    },
    cover :null,
    createCover :function()
    {
        var cover = $('<div></div>');
        cover.css({
            "position": "absolute",
            "top":"0px",
            "left":"0px",
            "width": "100%",
            "background-color": "rgba(111, 111, 111, 0.5)",
            "z-index": 10000,
            "display": "none",
            "height" : window.innerHeight + "px"
        });
        $("body").append(cover);
        return this.cover = cover;
    },
    showCover :function()
    {
        if(this.cover)
        {
            this.cover.show();
        } else {
            this.createCover().show();
        }
    },
    hideCover :function()
    {
        if(this.cover)
        {
            this.cover.hide();
        }
    },
    progressBar : null,
    alert : null,
    createAlertProgressBar :function(){//基于bootstrap样式
        var me = this;
        var alert = $('<div class="alert"></div>');
        alert.css({
            "position": "absolute",
            "width": "500px",
            "height": "200px",
            "background-color": "rgb(111, 111, 0)",
            "top":"50%",
            "left":"50%",
            "margin-left": "-250px",
            "margin-top": "-150px",
            "z-index": "10001",
            //"padding-top": "5px",
            "display": "none"
        });
        alert.append('<h4 style="text-align: center;color: #cce8d8;">文件上传进度</h4>')
        var closeBtn = $('<div>×</div>');
        closeBtn.css({
            'position' : 'absolute',
            'height'   : '30px',
            'width'    : '30px',
            'font-size': '24px',
            'color'    : 'white',
            'top'      : '0',
            'right'    : '0'
        });
        closeBtn.click(function(){
            me.hideAll();
        });
        alert.append(closeBtn);
        alert.append('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div></div>');
        alert.find('.progress').css({
            'margin-top' : "50px"
        });
        $("body").append(alert);
        this.progressBar = alert.find('.progress-bar');
        return this.alert = alert;

    },
    showAlert :function(){
        if(this.alert)
        {
            this.alert.show();
        }else {
            this.createAlertProgressBar().show();
        }
    },
    hideAlert :function(){
        if(this.alert)
        {
            this.alert.hide();
        }
    },
    progress :function(per){
        var me = this;
        me.showAll();
        $(me.progressBar).width(per + "%");
        $(me.progressBar).html(per + "%");
        if(per >= 100)
        {
            setTimeout(function(){
                me.hideAll();
                $(me.progressBar).width(0);
                $(me.progressBar).html('');
            },1000);
        }
    },
    showAll : function()
    {
        this.showCover();
        this.showAlert();
    },
    hideAll :function(){
        this.hideCover();
        this.hideAlert()
    }

};