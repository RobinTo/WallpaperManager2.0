var wallpaper = require('Wallpaper');
var scraper = require('scraper');
var file = require('File');
var fs = require('fs');
var jqoc = require('jqoc')($);
var placer = require('placer')($);
var settings = require('settings');

function loadLocalWallpapers(){
  settings.loadLocalImages();
  for(var i = 0; i < settings.getLocalImages().length; i++){
    addWallpaperToContent(settings.getLocalImages()[i]);
  }
}

function addWallpaperToContent(fileName){
  $('#content').append(jqoc.createImage(settings.getFullWallpaperPath(fileName), 'wallpaper'));
}

function createImageName(postTitle){
  var imgName = postTitle.split(/[\s,\.\[\]]+/);
  if(imgName.length > 1){
    imgName = imgName[0] + '' +imgName[1];
  } else{
    imgName = imgName[0];
  }
  return imgName;
}

function handleJsonResponse(body){
  json = JSON.parse(body);
  dataObjects = json.data.children;

  var duplicates = 0;
  for(var i = 0; i < dataObjects.length; i++){
    var data = dataObjects[i].data;
    data.title = data.title.replace(/([^a-zA-Z\d\s:])+/g, '');
    if(data.title.length <= 0){
      data.title = "wallpaper";
    }
    // Check that it is sfw, and a direct image link from imgur.
    if(settings.isPostOk(data)){
      var imgName = createImageName(data.title);
      // Check if url is already downloaded.
      if(!settings.isVisited(data.url)){

        // Append url to list of already loaded images
        settings.addVisitedUrl(data.url);

        // Check if name exists, if so, create a new random name.
        while(settings.checkForNameConflict(imgName)){
          console.log("Name conflict, adding random numbers to end of name.");
          imgName = imgName + "" + Math.floor((Math.random()*100) + 1).toString(); // If filename exists, add random numbers to the end.
        }
        // ----

        // Download the image. Delete it if it doesn't fit the dimensions.
        console.log('Downloading from ' + data.url);
        scraper.getImg(data.url, settings.getFullWallpaperPath(imgName+'.png'), function(filename){
          if(settings.isDimensionMismatch(filename)){
            settings.deleteWallpaper(filename);
            console.log('Did not save ' + filename + ' because of dimension mismatch.');
          } else{
            addWallpaperToContent(filename);
            console.log('Saved ' + filename + '.');
          }
        });
      } else{
        duplicates++;
      }
    }
  }
  console.log("Skipped " + duplicates + " duplicate urls.");
}

function scrapeForWallpapers(){
  console.log(settings.getSubredditList());
  for(var i = 0; i < settings.getSubredditList().length; i++){
    scraper.getJson(settings.getSubredditList()[i], handleJsonResponse);
  }
}

// When user selects an image to set as wallpaper
// takes src, and extracts the wallpaper name
// and sets it using the wallpaper.setWallpaper function.
function splitSrcAndSetWallpaper(src){
  var name = src.split('/');
  name = name[name.length-1];
  wallpaper.setWallpaper(name);
}



function bindSettingsWindow(settingsWindow){
  settingsWindow.find('#apply').click(function(){
    var options = {};
    options['savelocation'] = $('.saveLocation').text();

    if (!(/\/^/.test(options['savelocation']) || /\\^/.test(options['savelocation']))){
      options['savelocation'] += '\\';
    }

    options['loadnsfw'] = $('#loadnsfw').is(':checked');
    options['subredditlist'] = ['wallpaper', 'wallpapers']; // TODO: append all selected subreddits.
    var dimensions = [];
    if($('#alldims').is(':checked')){
      dimensions.push('all');
    }
    dimensions.push('1920x1080'); // TODO: append all selected dimensions.

    settings.saveSettings(options, dimensions);
    $('.popup').remove();
    $('.fadebg').remove();

    $('#content').html('');
    loadLocalWallpapers();
  });

  settingsWindow.find('#cancel').click(function(){
    $('.popup').remove();
    $('.fadebg').remove();
  });

  function chooseFile(name) {
    var chooser = $(name);
    chooser.change(function(evt) {
      $('.saveLocation').text($(this).val());
    });
    chooser.trigger('click');
  }
  settingsWindow.find('.saveLocation').click(function(){
    chooseFile('#fileDialog');
  });
}

// Settings wallpaper usage:
// wallpaper.setWallpaper('imgname.ext');
console.log("Loaded settings. Proceeding with document setup.");
document.addEventListener("DOMContentLoaded", function() {

  $('#closex').click(function(){
    window.close();
  });

  $(document).on('click', '.setWallpaperButton', function(){
    splitSrcAndSetWallpaper($('.fullWallpaper').attr('src'));
  });

  $(document).on('click', '#settingsx', function(){
    $('#content').append(jqoc.createFadedBg());
    var settingsWindow = jqoc.createSettingsWindow(settings.getOptions(), settings.getDimensions());
    bindSettingsWindow(settingsWindow);
    $('#content').append(settingsWindow);
  });

  $(document).on('click', '.wallpaper', function(){
    var src = $(this).attr('src');
    var title = src.split('\\');
    console.log(src);
    console.log(title);
    title = title[title.length-1];
    $('#content').append(jqoc.createFadedBg());
    $('#content').append(jqoc.createImage(src, 'fullWallpaper popup'));
    $('#content').append(jqoc.createWallpaperInfo(title, settings.createDimensionString(settings.sizeOfWallpaper(src))));


    $('.fullWallpaperInfo').css('top', placer.getBottomOfElement($('.fullWallpaper'), true));
    $('.fullWallpaperInfo').css('line-height', $('.fullWallpaperInfo').innerHeight() + 'px');
    $('.fullWallpaperInfo').css('width', $('.fullWallpaper').innerWidth());

  });

  $(document).on('click', '.fadebg', function(){
    $('.popup').remove();
    $('.fadebg').remove();
  });

  $(document).on('click', '.fullWallpaper', function(){
    splitSrcAndSetWallpaper($(this).attr('src'));
  });

  $(window).on('resize', function(){
    if($('.fullWallpaper').length > 0){
      $('.fullWallpaperInfo').css('top', placer.getBottomOfElement($('.fullWallpaper'), true));
      $('.fullWallpaperInfo').css('width', $('.fullWallpaper').innerWidth());
    }
  });

  loadLocalWallpapers();

  scrapeForWallpapers();
});
