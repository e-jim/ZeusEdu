;(function($){var _remove=$.fn.remove;$.fn.remove=function(){$("*",this).add(this).triggerHandler("remove");return _remove.apply(this,arguments);};function isVisible(element){function checkStyles(element){var style=element.style;return(style.display!='none'&&style.visibility!='hidden');}
var visible=checkStyles(element);(visible&&$.each($.dir(element,'parentNode'),function(){return(visible=checkStyles(this));}));return visible;}
$.extend($.expr[':'],{data:function(a,i,m){return $.data(a,m[3]);},tabbable:function(a,i,m){var nodeName=a.nodeName.toLowerCase();return(a.tabIndex>=0&&(('a'==nodeName&&a.href)||(/input|select|textarea|button/.test(nodeName)&&'hidden'!=a.type&&!a.disabled))&&isVisible(a));}});$.keyCode={BACKSPACE:8,CAPS_LOCK:20,COMMA:188,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38};function getter(namespace,plugin,method,args){function getMethods(type){var methods=$[namespace][plugin][type]||[];return(typeof methods=='string'?methods.split(/,?\s+/):methods);}
var methods=getMethods('getter');if(args.length==1&&typeof args[0]=='string'){methods=methods.concat(getMethods('getterSetter'));}
return($.inArray(method,methods)!=-1);}
$.widget=function(name,prototype){var namespace=name.split(".")[0];name=name.split(".")[1];$.fn[name]=function(options){var isMethodCall=(typeof options=='string'),args=Array.prototype.slice.call(arguments,1);if(isMethodCall&&options.substring(0,1)=='_'){return this;}
if(isMethodCall&&getter(namespace,name,options,args)){var instance=$.data(this[0],name);return(instance?instance[options].apply(instance,args):undefined);}
return this.each(function(){var instance=$.data(this,name);(!instance&&!isMethodCall&&$.data(this,name,new $[namespace][name](this,options)));(instance&&isMethodCall&&$.isFunction(instance[options])&&instance[options].apply(instance,args));});};$[namespace][name]=function(element,options){var self=this;this.widgetName=name;this.widgetEventPrefix=$[namespace][name].eventPrefix||name;this.widgetBaseClass=namespace+'-'+name;this.options=$.extend({},$.widget.defaults,$[namespace][name].defaults,$.metadata&&$.metadata.get(element)[name],options);this.element=$(element).bind('setData.'+name,function(e,key,value){return self._setData(key,value);}).bind('getData.'+name,function(e,key){return self._getData(key);}).bind('remove',function(){return self.destroy();});this._init();};$[namespace][name].prototype=$.extend({},$.widget.prototype,prototype);$[namespace][name].getterSetter='option';};$.widget.prototype={_init:function(){},destroy:function(){this.element.removeData(this.widgetName);},option:function(key,value){var options=key,self=this;if(typeof key=="string"){if(value===undefined){return this._getData(key);}
options={};options[key]=value;}
$.each(options,function(key,value){self._setData(key,value);});},_getData:function(key){return this.options[key];},_setData:function(key,value){this.options[key]=value;if(key=='disabled'){this.element[value?'addClass':'removeClass'](this.widgetBaseClass+'-disabled');}},enable:function(){this._setData('disabled',false);},disable:function(){this._setData('disabled',true);},_trigger:function(type,e,data){var eventName=(type==this.widgetEventPrefix?type:this.widgetEventPrefix+type);e=e||$.event.fix({type:eventName,target:this.element[0]});return this.element.triggerHandler(eventName,[e,data],this.options[type]);}};$.widget.defaults={disabled:false};$.ui={plugin:{add:function(module,option,set){var proto=$.ui[module].prototype;for(var i in set){proto.plugins[i]=proto.plugins[i]||[];proto.plugins[i].push([option,set[i]]);}},call:function(instance,name,args){var set=instance.plugins[name];if(!set){return;}
for(var i=0;i<set.length;i++){if(instance.options[set[i][0]]){set[i][1].apply(instance.element,args);}}}},cssCache:{},css:function(name){if($.ui.cssCache[name]){return $.ui.cssCache[name];}
var tmp=$('<div class="ui-gen">').addClass(name).css({position:'absolute',top:'-5000px',left:'-5000px',display:'block'}).appendTo('body');$.ui.cssCache[name]=!!((!(/auto|default/).test(tmp.css('cursor'))||(/^[1-9]/).test(tmp.css('height'))||(/^[1-9]/).test(tmp.css('width'))||!(/none/).test(tmp.css('backgroundImage'))||!(/transparent|rgba\(0, 0, 0, 0\)/).test(tmp.css('backgroundColor'))));try{$('body').get(0).removeChild(tmp.get(0));}catch(e){}
return $.ui.cssCache[name];},disableSelection:function(el){$(el).attr('unselectable','on').css('MozUserSelect','none').bind('selectstart.ui',function(){return false;});},enableSelection:function(el){$(el).attr('unselectable','off').css('MozUserSelect','').unbind('selectstart.ui');},hasScroll:function(e,a){var scroll=(a&&a=='left')?'scrollLeft':'scrollTop',has=false;if(e[scroll]>0){return true;}
e[scroll]=1;has=(e[scroll]>0);e[scroll]=0;return has;}};$.ui.mouse={_mouseInit:function(){var self=this;this.element.bind('mousedown.'+this.widgetName,function(e){return self._mouseDown(e);});if($.browser.msie){this._mouseUnselectable=this.element.attr('unselectable');this.element.attr('unselectable','on');}
this.started=false;},_mouseDestroy:function(){this.element.unbind('.'+this.widgetName);($.browser.msie&&this.element.attr('unselectable',this._mouseUnselectable));},_mouseDown:function(e){(this._mouseStarted&&this._mouseUp(e));this._mouseDownEvent=e;var self=this,btnIsLeft=(e.which==1),elIsCancel=(typeof this.options.cancel=="string"?$(e.target).parents().add(e.target).filter(this.options.cancel).length:false);if(!btnIsLeft||elIsCancel||!this._mouseCapture(e)){return true;}
this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet){this._mouseDelayTimer=setTimeout(function(){self.mouseDelayMet=true;},this.options.delay);}
if(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)){this._mouseStarted=(this._mouseStart(e)!==false);if(!this._mouseStarted){e.preventDefault();return true;}}
this._mouseMoveDelegate=function(e){return self._mouseMove(e);};this._mouseUpDelegate=function(e){return self._mouseUp(e);};$(document).bind('mousemove.'+this.widgetName,this._mouseMoveDelegate).bind('mouseup.'+this.widgetName,this._mouseUpDelegate);return false;},_mouseMove:function(e){if($.browser.msie&&!e.button){return this._mouseUp(e);}
if(this._mouseStarted){this._mouseDrag(e);return false;}
if(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)){this._mouseStarted=(this._mouseStart(this._mouseDownEvent,e)!==false);(this._mouseStarted?this._mouseDrag(e):this._mouseUp(e));}
return!this._mouseStarted;},_mouseUp:function(e){$(document).unbind('mousemove.'+this.widgetName,this._mouseMoveDelegate).unbind('mouseup.'+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._mouseStop(e);}
return false;},_mouseDistanceMet:function(e){return(Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance);},_mouseDelayMet:function(e){return this.mouseDelayMet;},_mouseStart:function(e){},_mouseDrag:function(e){},_mouseStop:function(e){},_mouseCapture:function(e){return true;}};$.ui.mouse.defaults={cancel:null,distance:1,delay:0};})(jQuery);(function($){$.widget("ui.autocomplete",{_init:function(){$.extend(this.options,{delay:this.options.url?$.Autocompleter.defaults.delay:10,max:!this.options.scroll?10:150,highlight:this.options.highlight||function(value){return value;},formatMatch:this.options.formatMatch||this.options.formatItem});new $.Autocompleter(this.element[0],this.options);},result:function(handler){return this.element.bind("result",handler);},search:function(handler){return this.element.trigger("search",[handler]);},flushCache:function(){return this.element.trigger("flushCache");},setData:function(key,value){return this.element.trigger("setOptions",[{key:value}]);},destroy:function(){return this.element.trigger("unautocomplete");}});$.Autocompleter=function(input,options){var KEY={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34,BACKSPACE:8};var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);if(options.result)$input.bind('result.autocomplete',options.result);var timeout;var previousValue="";var cache=$.Autocompleter.Cache(options);var hasFocus=0;var lastKeyPressCode;var config={mouseDownOnSelect:false};var select=$.Autocompleter.Select(options,input,selectCurrent,config);var blockSubmit;$.browser.opera&&$(input.form).bind("submit.autocomplete",function(){if(blockSubmit){blockSubmit=false;return false;}});$input.bind(($.browser.opera?"keypress":"keydown")+".autocomplete",function(event){lastKeyPressCode=event.keyCode;switch(event.keyCode){case KEY.UP:event.preventDefault();if(select.visible()){select.prev();}else{onChange(0,true);}
break;case KEY.DOWN:event.preventDefault();if(select.visible()){select.next();}else{onChange(0,true);}
break;case KEY.PAGEUP:event.preventDefault();if(select.visible()){select.pageUp();}else{onChange(0,true);}
break;case KEY.PAGEDOWN:event.preventDefault();if(select.visible()){select.pageDown();}else{onChange(0,true);}
break;case options.multiple&&$.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:if(selectCurrent()){event.preventDefault();blockSubmit=true;return false;}
break;case KEY.ESC:select.hide();break;default:clearTimeout(timeout);timeout=setTimeout(onChange,options.delay);break;}}).focus(function(){hasFocus++;}).blur(function(){hasFocus=0;if(!config.mouseDownOnSelect){hideResults();}}).click(function(){if(hasFocus++>1&&!select.visible()){onChange(0,true);}}).bind("search",function(){var fn=(arguments.length>1)?arguments[1]:null;function findValueCallback(q,data){var result;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].result.toLowerCase()==q.toLowerCase()){result=data[i];break;}}}
if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);}
$.each(trimWords($input.val()),function(i,value){request(value,findValueCallback,findValueCallback);});}).bind("flushCache",function(){cache.flush();}).bind("setOptions",function(){$.extend(options,arguments[1]);if("data"in arguments[1])
cache.populate();}).bind("unautocomplete",function(){select.unbind();$input.unbind();$(input.form).unbind(".autocomplete");});function selectCurrent(){var selected=select.selected();if(!selected)
return false;var v=selected.result;previousValue=v;if(options.multiple){var words=trimWords($input.val());if(words.length>1){v=words.slice(0,words.length-1).join(options.multipleSeparator)+options.multipleSeparator+v;}
v+=options.multipleSeparator;}
$input.val(v);hideResultsNow();$input.trigger("result",[selected.data,selected.value]);return true;}
function onChange(crap,skipPrevCheck){if(lastKeyPressCode==KEY.DEL){select.hide();return;}
var currentValue=$input.val();if(!skipPrevCheck&&currentValue==previousValue)
return;previousValue=currentValue;currentValue=lastWord(currentValue);if(currentValue.length>=options.minChars){$input.addClass(options.loadingClass);if(!options.matchCase)
currentValue=currentValue.toLowerCase();request(currentValue,receiveData,hideResultsNow);}else{stopLoading();select.hide();}};function trimWords(value){if(!value){return[""];}
var words=value.split(options.multipleSeparator);var result=[];$.each(words,function(i,value){if($.trim(value))
result[i]=$.trim(value);});return result;}
function lastWord(value){if(!options.multiple)
return value;var words=trimWords(value);return words[words.length-1];}
function autoFill(q,sValue){if(options.autoFill&&(lastWord($input.val()).toLowerCase()==q.toLowerCase())&&lastKeyPressCode!=KEY.BACKSPACE){$input.val($input.val()+sValue.substring(lastWord(previousValue).length));$.Autocompleter.Selection(input,previousValue.length,previousValue.length+sValue.length);}};function hideResults(){clearTimeout(timeout);timeout=setTimeout(hideResultsNow,200);};function hideResultsNow(){var wasVisible=select.visible();select.hide();clearTimeout(timeout);stopLoading();if(options.mustMatch){$input.autocomplete("search",function(result){if(!result){if(options.multiple){var words=trimWords($input.val()).slice(0,-1);$input.val(words.join(options.multipleSeparator)+(words.length?options.multipleSeparator:""));}
else
$input.val("");}});}
if(wasVisible)
$.Autocompleter.Selection(input,input.value.length,input.value.length);};function receiveData(q,data){if(data&&data.length&&hasFocus){stopLoading();select.display(data,q);autoFill(q,data[0].value);select.show();}else{hideResultsNow();}};function request(term,success,failure){if(!options.matchCase)
term=term.toLowerCase();var data=cache.load(term);if(data&&data.length){success(term,data);}else if((typeof options.url=="string")&&(options.url.length>0)){var extraParams={timestamp:+new Date()};$.each(options.extraParams,function(key,param){extraParams[key]=typeof param=="function"?param():param;});$.ajax({mode:"abort",port:"autocomplete"+input.name,dataType:options.dataType,url:options.url,data:$.extend({q:lastWord(term),limit:options.max},extraParams),success:function(data){var parsed=options.parse&&options.parse(data)||parse(data);cache.add(term,parsed);success(term,parsed);}});}
else if(options.source&&typeof options.source=='function'){var resultData=options.source(term);var parsed=(options.parse)?options.parse(resultData):resultData;cache.add(term,parsed);success(term,parsed);}else{select.emptyList();failure(term);}};function parse(data){var parsed=[];var rows=data.split("\n");for(var i=0;i<rows.length;i++){var row=$.trim(rows[i]);if(row){row=row.split("|");parsed[parsed.length]={data:row,value:row[0],result:options.formatResult&&options.formatResult(row,row[0])||row[0]};}}
return parsed;};function stopLoading(){$input.removeClass(options.loadingClass);};};$.Autocompleter.defaults={inputClass:"ui-autocomplete-input",resultsClass:"ui-autocomplete-results",loadingClass:"ui-autocomplete-loading",minChars:1,delay:400,matchCase:false,matchSubset:true,matchContains:false,cacheLength:10,max:100,mustMatch:false,extraParams:{},selectFirst:true,formatItem:function(row){return row[0];},formatMatch:null,autoFill:false,width:0,multiple:false,multipleSeparator:", ",highlight:function(value,term){return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");},scroll:true,scrollHeight:180};$.extend($.ui.autocomplete,{defaults:$.Autocompleter.defaults});$.Autocompleter.Cache=function(options){var data={};var length=0;function matchSubset(s,sub){if(!options.matchCase)
s=s.toLowerCase();var i=s.indexOf(sub);if(i==-1)return false;return i==0||options.matchContains;};function add(q,value){if(length>options.cacheLength){flush();}
if(!data[q]){length++;}
data[q]=value;}
function populate(){if(!options.data)return false;var stMatchSets={},nullData=0;if(!options.url)options.cacheLength=1;stMatchSets[""]=[];for(var i=0,ol=options.data.length;i<ol;i++){var rawValue=options.data[i];rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;var value=options.formatMatch(rawValue,i+1,options.data.length);if(value===false)
continue;var firstChar=value.charAt(0).toLowerCase();if(!stMatchSets[firstChar])
stMatchSets[firstChar]=[];var row={value:value,data:rawValue,result:options.formatResult&&options.formatResult(rawValue)||value};stMatchSets[firstChar].push(row);if(nullData++<options.max){stMatchSets[""].push(row);}};$.each(stMatchSets,function(i,value){options.cacheLength++;add(i,value);});}
setTimeout(populate,25);function flush(){data={};length=0;}
return{flush:flush,add:add,populate:populate,load:function(q){if(!options.cacheLength||!length)
return null;if(!options.url&&options.matchContains){var csub=[];for(var k in data){if(k.length>0){var c=data[k];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub.push(x);}});}}
return csub;}else
if(data[q]){return data[q];}else
if(options.matchSubset){for(var i=q.length-1;i>=options.minChars;i--){var c=data[q.substr(0,i)];if(c){var csub=[];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub[csub.length]=x;}});return csub;}}}
return null;}};};$.Autocompleter.Select=function(options,input,select,config){var CLASSES={ACTIVE:"ui-autocomplete-over"};var listItems,active=-1,data,term="",needsInit=true,element,list;function init(){if(!needsInit)
return;element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(document.body);list=$("<ul/>").appendTo(element).mouseover(function(event){if(target(event).nodeName&&target(event).nodeName.toUpperCase()=='LI'){active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));$(target(event)).addClass(CLASSES.ACTIVE);}}).click(function(event){$(target(event)).addClass(CLASSES.ACTIVE);select();input.focus();return false;}).mousedown(function(){config.mouseDownOnSelect=true;}).mouseup(function(){config.mouseDownOnSelect=false;});if(options.width>0)
element.css("width",options.width);needsInit=false;}
function target(event){var element=event.target;while(element&&element.tagName!="LI")
element=element.parentNode;if(!element)
return[];return element;}
function moveSelect(step){listItems.slice(active,active+1).removeClass(CLASSES.ACTIVE);movePosition(step);var activeItem=listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);if(options.scroll){var offset=0;listItems.slice(0,active).each(function(){offset+=this.offsetHeight;});if((offset+activeItem[0].offsetHeight-list.scrollTop())>list[0].clientHeight){list.scrollTop(offset+activeItem[0].offsetHeight-list.innerHeight());}else if(offset<list.scrollTop()){list.scrollTop(offset);}}};function movePosition(step){active+=step;if(active<0){active=listItems.size()-1;}else if(active>=listItems.size()){active=0;}}
function limitNumberOfItems(available){return options.max&&options.max<available?options.max:available;}
function fillList(){list.empty();var max=limitNumberOfItems(data.length);for(var i=0;i<max;i++){if(!data[i])
continue;var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);if(formatted===false)
continue;var li=$("<li/>").html(options.highlight(formatted,term)).addClass(i%2==0?"ui-autocomplete-even":"ui-autocomplete-odd").appendTo(list)[0];$.data(li,"ui-autocomplete-data",data[i]);}
listItems=list.find("li");if(options.selectFirst){listItems.slice(0,1).addClass(CLASSES.ACTIVE);active=0;}
if($.fn.bgiframe)
list.bgiframe();}
return{display:function(d,q){init();data=d;term=q;fillList();},next:function(){moveSelect(1);},prev:function(){moveSelect(-1);},pageUp:function(){if(active!=0&&active-8<0){moveSelect(-active);}else{moveSelect(-8);}},pageDown:function(){if(active!=listItems.size()-1&&active+8>listItems.size()){moveSelect(listItems.size()-1-active);}else{moveSelect(8);}},hide:function(){element&&element.hide();listItems&&listItems.removeClass(CLASSES.ACTIVE)
active=-1;$(input).triggerHandler("autocompletehide",[{},{options:options}],options["hide"]);},visible:function(){return element&&element.is(":visible");},current:function(){return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);},show:function(){var offset=$(input).offset();element.css({width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),top:offset.top+input.offsetHeight,left:offset.left}).show();if(options.scroll){list.scrollTop(0);list.css({maxHeight:options.scrollHeight,overflow:'auto'});if($.browser.msie&&typeof document.body.style.maxHeight==="undefined"){var listHeight=0;listItems.each(function(){listHeight+=this.offsetHeight;});var scrollbarsVisible=listHeight>options.scrollHeight;list.css('height',scrollbarsVisible?options.scrollHeight:listHeight);if(!scrollbarsVisible){listItems.width(list.width()-parseInt(listItems.css("padding-left"))-parseInt(listItems.css("padding-right")));}}}
$(input).triggerHandler("autocompleteshow",[{},{options:options}],options["show"]);},selected:function(){var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);return selected&&selected.length&&$.data(selected[0],"ui-autocomplete-data");},emptyList:function(){list&&list.empty();},unbind:function(){element&&element.remove();}};};$.Autocompleter.Selection=function(field,start,end){if(field.createTextRange){var selRange=field.createTextRange();selRange.collapse(true);selRange.moveStart("character",start);selRange.moveEnd("character",end);selRange.select();}else if(field.setSelectionRange){field.setSelectionRange(start,end);}else{if(field.selectionStart){field.selectionStart=start;field.selectionEnd=end;}}
field.focus();};})(jQuery);(function($){$.widget("ui.tabs",{_init:function(){this.options.event+='.tabs';this._tabify(true);},_setData:function(key,value){if((/^selected/).test(key))
this.select(value);else{this.options[key]=value;this._tabify();}},length:function(){return this.$tabs.length;},_tabId:function(a){return a.title&&a.title.replace(/\s/g,'_').replace(/[^A-Za-z0-9\-_:\.]/g,'')||this.options.idPrefix+$.data(a);},ui:function(tab,panel){return{options:this.options,tab:tab,panel:panel,index:this.$tabs.index(tab)};},_tabify:function(init){this.$lis=$('li:has(a[href])',this.element);this.$tabs=this.$lis.map(function(){return $('a',this)[0];});this.$panels=$([]);var self=this,o=this.options;this.$tabs.each(function(i,a){if(a.hash&&a.hash.replace('#',''))
self.$panels=self.$panels.add(a.hash);else if($(a).attr('href')!='#'){$.data(a,'href.tabs',a.href);$.data(a,'load.tabs',a.href);var id=self._tabId(a);a.href='#'+id;var $panel=$('#'+id);if(!$panel.length){$panel=$(o.panelTemplate).attr('id',id).addClass(o.panelClass).insertAfter(self.$panels[i-1]||self.element);$panel.data('destroy.tabs',true);}
self.$panels=self.$panels.add($panel);}
else
o.disabled.push(i+1);});if(init){this.element.addClass(o.navClass);this.$panels.each(function(){var $this=$(this);$this.addClass(o.panelClass);});if(o.selected===undefined){if(location.hash){this.$tabs.each(function(i,a){if(a.hash==location.hash){o.selected=i;if($.browser.msie||$.browser.opera){var $toShow=$(location.hash),toShowId=$toShow.attr('id');$toShow.attr('id','');setTimeout(function(){$toShow.attr('id',toShowId);},500);}
scrollTo(0,0);return false;}});}
else if(o.cookie){var index=parseInt($.cookie('ui-tabs-'+$.data(self.element[0])),10);if(index&&self.$tabs[index])
o.selected=index;}
else if(self.$lis.filter('.'+o.selectedClass).length)
o.selected=self.$lis.index(self.$lis.filter('.'+o.selectedClass)[0]);}
o.selected=o.selected===null||o.selected!==undefined?o.selected:0;o.disabled=$.unique(o.disabled.concat($.map(this.$lis.filter('.'+o.disabledClass),function(n,i){return self.$lis.index(n);}))).sort();if($.inArray(o.selected,o.disabled)!=-1)
o.disabled.splice($.inArray(o.selected,o.disabled),1);this.$panels.addClass(o.hideClass);this.$lis.removeClass(o.selectedClass);if(o.selected!==null){this.$panels.eq(o.selected).show().removeClass(o.hideClass);this.$lis.eq(o.selected).addClass(o.selectedClass);var onShow=function(){self._trigger('show',null,self.ui(self.$tabs[o.selected],self.$panels[o.selected]));};if($.data(this.$tabs[o.selected],'load.tabs'))
this.load(o.selected,onShow);else
onShow();}
$(window).bind('unload',function(){self.$tabs.unbind('.tabs');self.$lis=self.$tabs=self.$panels=null;});}
else
o.selected=this.$lis.index(this.$lis.filter('.'+o.selectedClass)[0]);if(o.cookie)
$.cookie('ui-tabs-'+$.data(self.element[0]),o.selected,o.cookie);for(var i=0,li;li=this.$lis[i];i++)
$(li)[$.inArray(i,o.disabled)!=-1&&!$(li).hasClass(o.selectedClass)?'addClass':'removeClass'](o.disabledClass);if(o.cache===false)
this.$tabs.removeData('cache.tabs');var hideFx,showFx,baseFx={'min-width':0,duration:1},baseDuration='normal';if(o.fx&&o.fx.constructor==Array)
hideFx=o.fx[0]||baseFx,showFx=o.fx[1]||baseFx;else
hideFx=showFx=o.fx||baseFx;var resetCSS={display:'',overflow:'',height:''};if(!$.browser.msie)
resetCSS.opacity='';function hideTab(clicked,$hide,$show){$hide.animate(hideFx,hideFx.duration||baseDuration,function(){$hide.addClass(o.hideClass).css(resetCSS);if($.browser.msie&&hideFx.opacity)
$hide[0].style.filter='';if($show)
showTab(clicked,$show,$hide);});}
function showTab(clicked,$show,$hide){if(showFx===baseFx)
$show.css('display','block');$show.animate(showFx,showFx.duration||baseDuration,function(){$show.removeClass(o.hideClass).css(resetCSS);if($.browser.msie&&showFx.opacity)
$show[0].style.filter='';self._trigger('show',null,self.ui(clicked,$show[0]));});}
function switchTab(clicked,$li,$hide,$show){$li.addClass(o.selectedClass).siblings().removeClass(o.selectedClass);hideTab(clicked,$hide,$show);}
this.$tabs.unbind('.tabs').bind(o.event,function(){var $li=$(this).parents('li:eq(0)'),$hide=self.$panels.filter(':visible'),$show=$(this.hash);if(($li.hasClass(o.selectedClass)&&!o.unselect)||$li.hasClass(o.disabledClass)||$(this).hasClass(o.loadingClass)||self._trigger('select',null,self.ui(this,$show[0]))===false){this.blur();return false;}
self.options.selected=self.$tabs.index(this);if(o.unselect){if($li.hasClass(o.selectedClass)){self.options.selected=null;$li.removeClass(o.selectedClass);self.$panels.stop();hideTab(this,$hide);this.blur();return false;}else if(!$hide.length){self.$panels.stop();var a=this;self.load(self.$tabs.index(this),function(){$li.addClass(o.selectedClass).addClass(o.unselectClass);showTab(a,$show);});this.blur();return false;}}
if(o.cookie)
$.cookie('ui-tabs-'+$.data(self.element[0]),self.options.selected,o.cookie);self.$panels.stop();if($show.length){var a=this;self.load(self.$tabs.index(this),$hide.length?function(){switchTab(a,$li,$hide,$show);}:function(){$li.addClass(o.selectedClass);showTab(a,$show);});}else
throw'jQuery UI Tabs: Mismatching fragment identifier.';if($.browser.msie)
this.blur();return false;});if(!(/^click/).test(o.event))
this.$tabs.bind('click.tabs',function(){return false;});},add:function(url,label,index){if(index==undefined)
index=this.$tabs.length;var o=this.options;var $li=$(o.tabTemplate.replace(/#\{href\}/g,url).replace(/#\{label\}/g,label));$li.data('destroy.tabs',true);var id=url.indexOf('#')==0?url.replace('#',''):this._tabId($('a:first-child',$li)[0]);var $panel=$('#'+id);if(!$panel.length){$panel=$(o.panelTemplate).attr('id',id).addClass(o.hideClass).data('destroy.tabs',true);}
$panel.addClass(o.panelClass);if(index>=this.$lis.length){$li.appendTo(this.element);$panel.appendTo(this.element[0].parentNode);}else{$li.insertBefore(this.$lis[index]);$panel.insertBefore(this.$panels[index]);}
o.disabled=$.map(o.disabled,function(n,i){return n>=index?++n:n});this._tabify();if(this.$tabs.length==1){$li.addClass(o.selectedClass);$panel.removeClass(o.hideClass);var href=$.data(this.$tabs[0],'load.tabs');if(href)
this.load(index,href);}
this._trigger('add',null,this.ui(this.$tabs[index],this.$panels[index]));},remove:function(index){var o=this.options,$li=this.$lis.eq(index).remove(),$panel=this.$panels.eq(index).remove();if($li.hasClass(o.selectedClass)&&this.$tabs.length>1)
this.select(index+(index+1<this.$tabs.length?1:-1));o.disabled=$.map($.grep(o.disabled,function(n,i){return n!=index;}),function(n,i){return n>=index?--n:n});this._tabify();this._trigger('remove',null,this.ui($li.find('a')[0],$panel[0]));},enable:function(index){var o=this.options;if($.inArray(index,o.disabled)==-1)
return;var $li=this.$lis.eq(index).removeClass(o.disabledClass);if($.browser.safari){$li.css('display','inline-block');setTimeout(function(){$li.css('display','block');},0);}
o.disabled=$.grep(o.disabled,function(n,i){return n!=index;});this._trigger('enable',null,this.ui(this.$tabs[index],this.$panels[index]));},disable:function(index){var self=this,o=this.options;if(index!=o.selected){this.$lis.eq(index).addClass(o.disabledClass);o.disabled.push(index);o.disabled.sort();this._trigger('disable',null,this.ui(this.$tabs[index],this.$panels[index]));}},select:function(index){if(typeof index=='string')
index=this.$tabs.index(this.$tabs.filter('[href$='+index+']')[0]);this.$tabs.eq(index).trigger(this.options.event);},load:function(index,callback){var self=this,o=this.options,$a=this.$tabs.eq(index),a=$a[0],bypassCache=callback==undefined||callback===false,url=$a.data('load.tabs');callback=callback||function(){};if(!url||!bypassCache&&$.data(a,'cache.tabs')){callback();return;}
var inner=function(parent){var $parent=$(parent),$inner=$parent.find('*:last');return $inner.length&&$inner.is(':not(img)')&&$inner||$parent;};var cleanup=function(){self.$tabs.filter('.'+o.loadingClass).removeClass(o.loadingClass).each(function(){if(o.spinner)
inner(this).parent().html(inner(this).data('label.tabs'));});self.xhr=null;};if(o.spinner){var label=inner(a).html();inner(a).wrapInner('<em></em>').find('em').data('label.tabs',label).html(o.spinner);}
var ajaxOptions=$.extend({},o.ajaxOptions,{url:url,success:function(r,s){$(a.hash).html(r);cleanup();if(o.cache)
$.data(a,'cache.tabs',true);self._trigger('load',null,self.ui(self.$tabs[index],self.$panels[index]));o.ajaxOptions.success&&o.ajaxOptions.success(r,s);callback();}});if(this.xhr){this.xhr.abort();cleanup();}
$a.addClass(o.loadingClass);setTimeout(function(){self.xhr=$.ajax(ajaxOptions);},0);},url:function(index,url){this.$tabs.eq(index).removeData('cache.tabs').data('load.tabs',url);},destroy:function(){var o=this.options;this.element.unbind('.tabs').removeClass(o.navClass).removeData('tabs');this.$tabs.each(function(){var href=$.data(this,'href.tabs');if(href)
this.href=href;var $this=$(this).unbind('.tabs');$.each(['href','load','cache'],function(i,prefix){$this.removeData(prefix+'.tabs');});});this.$lis.add(this.$panels).each(function(){if($.data(this,'destroy.tabs'))
$(this).remove();else
$(this).removeClass([o.selectedClass,o.unselectClass,o.disabledClass,o.panelClass,o.hideClass].join(' '));});}});$.ui.tabs.defaults={unselect:false,event:'click',disabled:[],cookie:null,spinner:'Loading&#8230;',cache:false,idPrefix:'ui-tabs-',ajaxOptions:{},fx:null,tabTemplate:'<li><a href="#{href}"><span>#{label}</span></a></li>',panelTemplate:'<div></div>',navClass:'ui-tabs-nav',selectedClass:'ui-tabs-selected',unselectClass:'ui-tabs-unselect',disabledClass:'ui-tabs-disabled',panelClass:'ui-tabs-panel',hideClass:'ui-tabs-hide',loadingClass:'ui-tabs-loading'};$.ui.tabs.getter="length";$.extend($.ui.tabs.prototype,{rotation:null,rotate:function(ms,continuing){continuing=continuing||false;var self=this,t=this.options.selected;function start(){self.rotation=setInterval(function(){t=++t<self.$tabs.length?t:0;self.select(t);},ms);}
function stop(e){if(!e||e.clientX){clearInterval(self.rotation);}}
if(ms){start();if(!continuing)
this.$tabs.bind(this.options.event,stop);else
this.$tabs.bind(this.options.event,function(){stop();t=self.options.selected;start();});}
else{stop();this.$tabs.unbind(this.options.event,stop);}}});})(jQuery);