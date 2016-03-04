$(function(){
  var timerID;
  var timerArray = new Array();
  var timer;
  timelineAllLoad();
  if ( gorgon.timer != undefined )
  {
    timer = gorgon.timer;
  }
  else
  {
    timer = 15000;
  }
  timerID = setInterval('timelineDifferenceLoad()', timer);
  if ( gorgon.notify !== undefined )
  {
    $('#timeline-desktopify').desktopify({
      unsupported : function(){
        $('#timeline-desktopify').hide();
      }
    }).trigger('click');
  }

  $('#timeline-submit-button').click( function() {
    $('#timeline-submit-error').text('');
    $('#timeline-submit-error').hide();
    $('#timeline-submit-loader').show();
    var body = $('#timeline-textarea').val();
    if (gorgon)
    {
      var data = {
        body: body,
        target: gorgon.post.foreign,
        target_id: gorgon.post.foreignId,
        apiKey: openpne.apiKey
      };
    }
    else
    {
      var data = {
        body: body,
        apiKey: openpne.apiKey
      };
    }
    $.ajax({
      url: openpne.apiBase + 'activity/post.json',
      type: 'POST',
      data: data,
      dataType: 'json',
      success: function(json) {
        timelineAllLoad();
        $('#timeline-submit-loader').hide();
        $('#timeline-textarea').val('');
      },
      error: function(x, r, e){
        $('#timeline-submit-loader').hide();
        $('#timeline-submit-error').text('投稿に失敗しました');
        $('#timeline-submit-error').show();
      }
    });
  });

  $('#timeline-loadmore').click( function() {
    $('#timeline-loadmore').hide();
    $('#timeline-loadmore-loading').show();
    timelineLoadmore();
  });
});

function timelineAllLoad() {
  if (gorgon)
  {
    gorgon.apiKey = openpne.apiKey;
    $.ajax({
      type: 'GET',
      url: openpne.apiBase + 'activity/search.json',
      data: gorgon,
      success: function(json){
        renderJSON(json, 'all');
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        $('#timeline-loading').hide();
        $('#timeline-list').text('タイムラインは投稿されていません。');
        $('#timeline-list').show();
      },  
    }); 
  }
  else
  {
    $.ajax({
      type: 'GET',
      url: openpne.apiBase + 'activity/search.json?apiKey=' + openpne.apiKey,
      success: function(json){
        renderJSON(json, 'all');
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
      $('#timeline-loading').hide();
      $('#timeline-list').text('タイムラインは投稿されていません。');
      $('#timeline-list').show();
      },  
    }); 
  }
}

function timelineDifferenceLoad() {
  var lastId = $('#timeline-list').attr('data-last-id');
  if (gorgon)
  {
    gorgon.apiKey = openpne.apiKey;
  }
  else
  {
    gorgon = {apiKey: openpne.apiKey,}
  }
  $.getJSON( openpne.apiBase + 'activity/search.json?count=20&since_id=' + lastId, gorgon, function(json){
    renderJSON(json, 'diff');
  });
}

function timelineLoadmore() {
  var loadmoreId = $('#timeline-list').attr('data-loadmore-id');
  loadmoreId = loadmoreId - 1;
  if (gorgon)
  {
    gorgon.apiKey = openpne.apiKey;
  }
  else
  {
    gorgon = {apiKey: openpne.apiKey,}
  }
  gorgon.max_id = loadmoreId;

  $.ajax({
    type: 'GET',
    url: openpne.apiBase + 'activity/search.json',
    data: gorgon,
    success: function(json){
      renderJSON(json, 'more');
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){
      $('#timeline-loadmore-loading').hide();
    },  
  }); 
}

function renderJSON(json, mode) {
  if (undefined == mode)
  {
    mode = 'all';
  }
  if ('all' == mode)
  {
    $('#timeline-list').empty();
  }

  $timelineData = $('#timelineTemplate').tmpl(json.data);
  $('.timeline-comment-button', $timelineData).timelineComment();
  $('.timeline-comment-link', $timelineData).click(function(){
    $commentBoxArea = $(this).parent().siblings().find('.timeline-post-comment-form');
    $commentBoxArea.show();
    $commentBoxArea.children('.timeline-post-comment-form-input').focus();
  });
  if ('diff' == mode)
  {
    $timelineData.prependTo('#timeline-list');
  }
  else
  {
    $timelineData.appendTo('#timeline-list');
  }
  if ('all' == mode || 'diff' == mode)
  {
    if(json.data[0])
    {
      $('#timeline-list').attr('data-last-id', json.data[0].id);
    }
  }
  if ('all' == mode || 'more' == mode)
  {
    var max = json.data.length - 1;
    if (json.data[max])
    {
      $('#timeline-list').attr('data-loadmore-id', json.data[max].id);
    }
  }
  if(json.data)
  {
    for(i=0;i<json.data.length;i++)
    {
      if(json.data[i].replies)
      {
        $('#timelineCommentTemplate').tmpl(json.data[i].replies).prependTo('#commentlist-' +json.data[i].id);
        $('#timeline-post-comment-form-' + json.data[i].id, $timelineData).show();
      }
    }
  }
  $('button.timeline-post-delete-button').timelineDelete();
  $('.timeline-post-delete-confirm-link').colorbox({
    inline: true,
    width: '610px',
    opacity: '0.8',
    onOpen: function(){ 
      $($(this).attr('href')).show(); 
    },
    onCleanup: function(){ 
      $($(this).attr('href')).hide();
    },
    onClosed: function(){
      timelineAllLoad();
    },
  });
  if ('all' == mode)
  {
    $('#timeline-loading').hide();
  }
  if ('more' == mode)
  {
    $('#timeline-loadmore').show();
    $('#timeline-loadmore-loading').hide();
  }
}

function convertTag(str) {
  str = str.replace(/&/g,'&amp;');
  str = str.replace(/"/g,'&quot;');
  str = str.replace(/'/g,'&#039;');
  str = str.replace(/</g,'&lt;');
  str = str.replace(/>/g,'&gt;');
  return str;
}
