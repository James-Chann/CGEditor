/**
 * atricle: chenggang
 * title: 富文本编辑器
 */

var range;
var req_url;
var img_url;

$(function () {
  // 图片上传功能
  toolPicUpload();
})

// 富文本插件构造函数
function CGEditor(obj) {
  this.reqUrl = obj.reqUrl;
  this.imgUrl = obj.imgUrl;
  this.picUpload = obj.picUpload;
  this.init = function () {
    req_url = this.reqUrl;
    img_url = this.imgUrl;
    if (this.picUpload) {
      var content = '<div class="bar_pic">\
                       <a href="javascript:void(0)" class="pic_upload">\
                         <i class="fa fa-picture-o" aria-hidden="true"></i>\
                       </a>\
                     </div>'
      $('.tool_bar').html(content);
    }
  }
}

// ---图片上传start-----------------------------------------------------------------------------/
function toolPicUpload() {
  // open 模态框
  $('.pic_upload').click(function () {
    $('.custom_file_label').html('未选择文件');
    $('#picUploadModal').modal('show');
    $('#editor').focus();
  })

  // show 文件名称
  callShowTxt();

  $('#editor').blur(function () {
    getRange();
  });

  // picture 确定上传
  $('#picUploadConfirm').click(function () {
    var file = $('#picFile')[0].files[0];
    confirmUploadPic(file);
  })
}

// 回显选择的文件名称
function callShowTxt() {
  $(document).off('change', 'input[type="file"]')
    .on('change', 'input[type="file"]', function (e) {
      var name = $(e.currentTarget)[0].files[0].name;
      if (name.length > 18) {
        name = name.substring(0, 18);
      }
      $(e.currentTarget).next('label').html(name);
    })
}

// 确定上传图片
function confirmUploadPic(file) {
  validation(file);
  var formdata = new FormData();
  formdata.append('imgFile', file);
  $.ajax({
    type: 'post',
    url: req_url,
    data: formdata,
    contentType: false,
    processData: false,
    dataType: 'json',
    success: function (data) {
      var temp = data.url.split('image');
      var url = img_url + temp[1];
      insertHtmlAtCaret('<img onload = "javascript:DrawImage(this,345,300)" src="' + url + '"/>')
      $('#picUploadModal').modal('hide');
    }
  });
  $('#picFile').val('');
  var obj = document.getElementById('picFile');
  $('#picFile').text('未选择文件');
}

// 图片校验
function validation(file) {
  if (file == undefined) {
    alertModel('请选择文件!');
    return
  }
  if (file.size > 10485760) {
    alertModel('上传的图片请小于10M!');
    return;
  }
  if (file == '' || file == undefined) {
    alertModel('请选择文件!');
    return;
  }
}

// 富文本回显图片(支持在光标后插入)
function insertHtmlAtCaret(html) {
  var sel;
  if (window.getSelection) {
    sel = window.getSelection();
    range.deleteContents();
    var el = document.createElement('div');
    el.innerHTML = html;
    var frag = document.createDocumentFragment(),
      node, lastNode;
    while ((node = el.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);
    // Preserve the selection
    if (lastNode) {
      range = range.cloneRange();
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

// 获取光标
function getRange() {
  var sel;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
    }
  }
}

//复制图片
function pastePic() {
  var items = (event.clipboardData && event.clipboardData.items) || [];
  var file = null;
  if (items && items.length) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        file = items[i].getAsFile();
        confirmUploadPic(file);
        break;
      }
    }
  }
}

//等比例缩放图片
function DrawImage(ImgObj, maxWidth, maxHeight) {
  var image = new Image();
  //原图片原始地址
  image.src = ImgObj.src;
  //设定图片的宽高
  var tempWidth;
  var tempHeight;

  if (image.width > 0 && image.height > 0) {
    if (image.width / image.height >= maxWidth / maxHeight) {
      if (image.width > maxWidth) {
        tempWidth = maxWidth;

        tempHeight = (image.height * maxWidth) / image.width;
      } else {
        tempWidth = image.width;
        tempHeight = image.height;
      }
    } else {
      if (image.height > maxHeight) {
        tempHeight = maxHeight;
        tempWidth = (image.width * maxHeight) / image.height;
      } else {
        tempWidth = image.width;
        tempHeight = image.height;
      }
    }
    ImgObj.height = tempHeight;
    ImgObj.width = tempWidth;

    ImgObj.alt = image.width + "*" + image.height;
  }
}
// ---图片上传end-----------------------------------------------------------------------------/