//CanImageManager
function CanImageUI()
	{
	this.loadHandler=ewkLib.newEventHandler(this,this.load);
	window.addEventListener('load', this.loadHandler, false);
	this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
	window.addEventListener('unload', this.unLoadHandler, false);
	this._frozen=false;
	this._fSelX=-1;
	this._fSelY=-1;
	};
CanImageUI.prototype.load = function ()
	{
	window.removeEventListener('load', this.loadHandler, false);
	var evt = window.parent.document.createEvent('Events');
	evt.initEvent('sidebarload', true, true);
	evt.sidebarWindow=this;
	evt.sidebarName='canimage';
	evt.standAlone=true;
	if(window.parent)
		window.parent.dispatchEvent(evt);
	this.canvas=document.getElementById('canImageCanvas');
	// Getting locales
	this.localeProperties = document.getElementById("canimage-properties");
	// Buttons events
	document.getElementById('canImageOpenFile').addEventListener('command', ewkLib.newEventHandler(this,this.openFromFile), false);
	document.getElementById('canImageOpenWindow').addEventListener('command', ewkLib.newEventHandler(this,this.openFromWindow), false);
	document.getElementById('canImageOpenPage').addEventListener('command', ewkLib.newEventHandler(this,this.openFromPage), false);
	document.getElementById('canImageOpenVisible').addEventListener('command', ewkLib.newEventHandler(this,this.openFromVisible), false);
	document.getElementById('canImageOpenClipboard').addEventListener('command', ewkLib.newEventHandler(this,this.openFromClipboard), false);
	document.getElementById('canImageSave').addEventListener('command', ewkLib.newEventHandler(this,this.saveFile), false);
	document.getElementById('canImageSaveAs').addEventListener('command', ewkLib.newEventHandler(this,this.saveAsFile), false);
	document.getElementById('canImageClipboardBmp').addEventListener('command', ewkLib.newEventHandler(this,this.sendToClipboardBmp), false);
	document.getElementById('canImageClipboardB64').addEventListener('command', ewkLib.newEventHandler(this,this.sendToClipboardB64), false);
	document.getElementById('canImageBBComposer').addEventListener('command', ewkLib.newEventHandler(this,this.sendToBBComposer), false);
	document.getElementById('canImageBBComposerB64').addEventListener('command', ewkLib.newEventHandler(this,this.sendToBBComposerB64), false);
	document.getElementById('canImageReset').addEventListener('command', ewkLib.newEventHandler(this,this.reset), false);
	// Menupopups events
	document.getElementById('canImagePagePopup').addEventListener('popupshowing', ewkLib.newEventHandler(this,this.displayImagesMenupopup), false);
	document.getElementById('canImageInputPopup').addEventListener('popupshowing', ewkLib.newEventHandler(this,this.displayInputsMenupopup), false);
	document.getElementById('canImageFieldPopup').addEventListener('popupshowing', ewkLib.newEventHandler(this,this.displayFieldsMenupopup), false);
	// Editor buttons events
	document.getElementById('canImageZoomIn').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageZoomOut').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageRotateLeft').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageRotateRight').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageHorizontalFlip').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageVerticalFlip').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageLessBrightness').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageMoreBrightness').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageLessContrast').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageMoreContrast').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageInverseColors').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	document.getElementById('canImageCropZone').addEventListener('command', ewkLib.newEventHandler(this,this.editorEventHandler), false);
	// Temporary files
	this.tempNum=0;
	// Open selected image
	if(window.parent.canImageSelType)
		this.openFromContextMenu();
	}
CanImageUI.prototype.run = function (editorManager)
	{
	this.editorManager=editorManager;
	this.displayHandler=ewkLib.newEventHandler(this,this.display);
	document.addEventListener('display', this.displayHandler, false);
	}
CanImageUI.prototype.display = function (hEvent)
	{
	var curElement = this.editorManager.focusedBBComposer.getSelectedElement();
	if(curElement.nodeName.toLowerCase()=='img')
		this.openImageEditor(curElement);
	}
CanImageUI.prototype.unLoad = function ()
	{
	window.clearTimeout(this.refreshInterval);
	window.removeEventListener('unload', this.unLoadHandler, false);
	if(this.editorManager)
		this.editorManager.toggleSidebar('canimage',false);
	}
CanImageUI.prototype.update = function ()
	{
	if(this.editor)
		{
		document.getElementById('canImageInverseColors').checked=this.editor.inverse;
		document.getElementById('canImageStack').setAttribute('width',this.canvas.offsetWidth+'px');
		document.getElementById('canImageStack').setAttribute('height',this.canvas.offsetHeight+'px');
		document.getElementById('canImageWidth').value=this.canvas.width;
		document.getElementById('canImageHeight').value=this.canvas.height;
		document.getElementById('canImageSize').value=this.canvas.toDataURL("image/png").length*6/8/1000;
		}
	}
CanImageUI.prototype.__defineSetter__("frozen", function(state)
	{
	this._frozen=state;
	var buttons=document.getElementsByTagName('toolbarbutton');
	for(var i=buttons.length-1; i>=0; i--)
		{
		buttons[i].disabled=state;
		}
	});
CanImageUI.prototype.__defineGetter__("frozen", function()
	{
	return this._frozen;
	});
CanImageUI.prototype.getSelection = function (callback)
	{
	this.frozen=true;
	this.selectionCallback=callback;
	document.getElementById('canImageStack').setAttribute('class','canImageFSelection');
	document.getElementById('canImageStack').addEventListener('click',ewkLib.newEventHandler(this,this.handleSelection,'handleSelection'),false);
	document.getElementById('canImageStack').addEventListener('mousemove',ewkLib.newEventHandler(this,this.followSelection,'followSelection'),false);
	}
CanImageUI.prototype.followSelection = function (hEvent)
	{
	if(this._fSelX<0&&this._fSelY<0)
		{
		document.getElementById('canImageFHSelector').setAttribute('top',(hEvent.clientY+document.getElementById('canImageContainer').scrollTop-document.getElementById('canImageCanvas').offsetTop)+'px');
		document.getElementById('canImageFHSelector').setAttribute('left','0px');
		document.getElementById('canImageFHSelector').setAttribute('width',document.getElementById('canImageCanvas').offsetWidth+'px');
		document.getElementById('canImageFVSelector').setAttribute('top','0px');
		document.getElementById('canImageFVSelector').setAttribute('left',(hEvent.clientX+document.getElementById('canImageContainer').scrollLeft-document.getElementById('canImageCanvas').clientLeft)+'px');
		document.getElementById('canImageFVSelector').setAttribute('height',document.getElementById('canImageCanvas').offsetHeight+'px');
		}
	else
		{
		document.getElementById('canImageSHSelector').setAttribute('top',(hEvent.clientY+document.getElementById('canImageContainer').scrollTop-document.getElementById('canImageCanvas').offsetTop)+'px');
		document.getElementById('canImageSHSelector').setAttribute('left','0px');
		document.getElementById('canImageSHSelector').setAttribute('width',document.getElementById('canImageCanvas').offsetWidth+'px');
		document.getElementById('canImageSVSelector').setAttribute('top','0px');
		document.getElementById('canImageSVSelector').setAttribute('left',(hEvent.clientX+document.getElementById('canImageContainer').scrollLeft-document.getElementById('canImageCanvas').offsetLeft)+'px');
		document.getElementById('canImageSVSelector').setAttribute('height',document.getElementById('canImageCanvas').offsetHeight+'px');
		}
	}
CanImageUI.prototype.handleSelection = function (hEvent)
	{
	if(hEvent.button==2)
		{
		this.endSelection(hEvent);
		}
	else
		{
		if(this._fSelX<0&&this._fSelY<0)
			{
			this._fSelX=hEvent.clientX+document.getElementById('canImageContainer').scrollLeft-document.getElementById('canImageCanvas').offsetLeft;
			this._fSelY=hEvent.clientY+document.getElementById('canImageContainer').scrollTop-document.getElementById('canImageCanvas').offsetTop;
			document.getElementById('canImageStack').setAttribute('class','canImageSSelection');
			}
		else
			{
			var _lSelX=hEvent.clientX+document.getElementById('canImageContainer').scrollLeft-document.getElementById('canImageCanvas').offsetLeft;
			var _lSelY=hEvent.clientY+document.getElementById('canImageContainer').scrollTop-document.getElementById('canImageCanvas').offsetTop;
			var temp;
			if(this._fSelX>_lSelX)
				{
				temp=this._fSelX;
				this._fSelX=_lSelX;
				_lSelX=temp;
				}
			if(this._fSelY>_lSelY)
				{
				temp=this._fSelY;
				this._fSelY=_lSelY;
				_lSelY=temp;
				}
			this.selectionCallback(
				this._fSelX/document.getElementById('canImageCanvas').offsetWidth,
				this._fSelY/document.getElementById('canImageCanvas').offsetHeight,
				(_lSelX-this._fSelX)/document.getElementById('canImageCanvas').offsetWidth,
				(_lSelY-this._fSelY)/document.getElementById('canImageCanvas').offsetHeight);
			this.endSelection(hEvent);
			}
		}
	}
CanImageUI.prototype.endSelection = function (hEvent)
	{
	document.getElementById('canImageStack').removeAttribute('class');
	document.getElementById('canImageStack').removeEventListener('mousemove',ewkLib.newEventHandler(this,this.followSelection,'followSelection'),false);
	document.getElementById('canImageStack').removeEventListener('click',ewkLib.newEventHandler(this,this.handleSelection,'handleSelection'),false);
	this._fSelX=-1;
	this._fSelY=-1;
	this.frozen=false;
	}
CanImageUI.prototype.editorEventHandler = function (hEvent)
	{
	if(this.editor)
		{
		var attribute=hEvent.target.getAttribute('id');
		if(attribute&&attribute.indexOf('canImage')===0)
			{
			this.editor[attribute.substring(8,9).toLowerCase()+attribute.substring(9)]();
			}
		}
	}
// Buttons functions
CanImageUI.prototype.openFromFile = function ()
	{
	var file = new ewkFile();
	if(file.fromUserSelection(this.localeProperties.getString('extensions.canimage@elitwork.com.open'),(this.currentFileUri?this.currentFileUri.replace(/(.+)\/(?:[^\/]+)/,'$1/'):''),(this.currentFileUri?this.currentFileUri.replace(/(?:.+)\/([^\/]+)/,'$1'):''),'*.png; *.jpg; *.jpeg; *.gif; *.bmp',this.localeProperties.getString('extensions.canimage@elitwork.com.file_filter')))
		{
		var image = new Image();
		image.addEventListener('load', ewkLib.newEventHandler(this,this.imageHandler), false);
		image.src=file.getUri();
		this.currentFileUri=file.getUri();
		}
	}
CanImageUI.prototype.openFromContextMenu = function ()
	{
	this.currentFileUri='';
	var type=window.parent.canImageSelType;
	var selection=window.parent.canImageCurSel;
	if(type=='link'||type=='bg')
		{
		this.openFromDataUri(selection);
		}
	else if(selection.nodeName.toLowerCase()=='img')
		{
		var image = new Image();
		image.addEventListener('load', ewkLib.newEventHandler(this,this.imageHandler), false);
		image.src=selection.src;
		}
	else if(selection.nodeName.toLowerCase()=='canvas')
		{
		this.openFromDataUri(selection.toDataURL("image/png"));
		}
	else if(selection.nodeName.toLowerCase()=='video')
		{
		this.openImageEditor(selection);
		}
	}
CanImageUI.prototype.streamUri = '';
CanImageUI.prototype.openFromDataUri = function (data)
	{
	this.currentFileUri='';
	var image = new Image();
	image.addEventListener('load', ewkLib.newEventHandler(this,this.imageHandler), false);
	image.src=data;
	}
CanImageUI.prototype.openFromWindow = function (data)
	{
	this.openFromCapture(window.parent,{
		'top': 0,
		'left': 0,
		'width': window.parent.document.documentElement.scrollWidth,
		'height': window.parent.document.documentElement.scrollHeight,
		});
	}
CanImageUI.prototype.openFromPage = function ()
	{
	this.openFromCapture(window.parent.getBrowser().contentWindow,{
		'top': 0,
		'left': 0,
		'width': window.parent.getBrowser().contentDocument.documentElement.scrollWidth,
		'height': window.parent.getBrowser().contentDocument.documentElement.scrollHeight,
		});
	}
CanImageUI.prototype.openFromVisible = function ()
	{
	this.openFromCapture(window.parent.getBrowser().contentWindow,{
		'top': window.parent.getBrowser().contentWindow.scrollY,
		'left': window.parent.getBrowser().contentWindow.scrollX,
		'width': window.parent.getBrowser().contentWindow.outerWidth,
		'height': window.parent.getBrowser().contentWindow.outerHeight,
		});
	}
CanImageUI.prototype.openFromCapture = function (win,sel)
	{
	this.currentFileUri='';
	var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'html:canvas');
	var context = canvas.getContext('2d');
	canvas.height = sel.height;
	canvas.width = sel.width;
	context.drawWindow(
		win,
		(sel.left?sel.left:0),
		(sel.top?sel.top:0),
		sel.width,
		sel.height,
		'rgb(255, 255, 255)'
		);
	var image = new Image();
	image.addEventListener('load', ewkLib.newEventHandler(this,this.imageHandler), false);
	image.src=canvas.toDataURL('image/png', '');
	}
CanImageUI.prototype.openFromClipboard = function ()
	{
	this.streamUri='';
	var clip = Components.classes["@mozilla.org/widget/clipboard;1"]
			.createInstance(Components.interfaces.nsIClipboard);
	if (!clip)
		return null;
	var trans = Components.classes["@mozilla.org/widget/transferable;1"]
		.createInstance(Components.interfaces.nsITransferable);
	if (!trans)
		return null;
	trans.addDataFlavor("image/jpg");
	trans.addDataFlavor("image/png");
	trans.addDataFlavor("image/jpeg");
	trans.addDataFlavor("image/gif");
	clip.getData(trans,clip.kGlobalClipboard);
	var flavor = new Object();
	var str = new Object();
	var strLength = new Object();
	try
		{
		trans.getAnyTransferData(flavor,str,strLength);
		var file;

		if(flavor.value=='image/png')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsIInputStream);;
			file = new ewkFile(null);
			if(file.fromTempDirectory(this.tempNum+'canimage.jpg')||file.createUnique())
				{
				this.streamUri=file.getUri();
				file.writeFromStream(str, ewkLib.newEventHandler(this,this.streamHandler));
				}
			this.tempNum++;
			}
		else if(flavor.value=='image/gif')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsIInputStream);;
			vfile = new ewkFile(null);
			if(file.fromTempDirectory(this.tempNum+'canimage.jpg')||file.createUnique())
				{
				this.streamUri=file.getUri();
				file.writeFromStream(str, ewkLib.newEventHandler(this,this.streamHandler));
				}
			this.tempNum++;
			}
		else if(flavor.value=='image/jpg'||flavor.value=='image/jpeg')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsIInputStream);;
			file = new ewkFile(null);
			if(file.fromTempDirectory(this.tempNum+'canimage.jpg')||file.createUnique())
				{
				this.streamUri=file.getUri();
				file.writeFromStream(str, ewkLib.newEventHandler(this,this.streamHandler));
				}
			this.tempNum++;
			}
		else
		alert(flavor.value+' '+this.localeProperties.getString('extensions.canimage@elitwork.com.not_supported'));
		}
	catch (ex)
		{
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.nothing_in_clipboard'));
		}
	}
CanImageUI.prototype.streamHandler= function (aRequest, aContext, aStatusCode)
	{
	if(this.streamUri)
		{
		var image = new Image();
		image.src=this.streamUri;
		image.addEventListener('load', ewkLib.newEventHandler(this,this.imageHandler), false);
		}
	}
CanImageUI.prototype.imageHandler = function (hEvent)
	{
	this.openImageEditor(hEvent.target);
	}
CanImageUI.prototype.saveFile = function ()
	{
	if(this.editor&&this.currentFileUri)
		{
		var file = new ewkFile();
		if(file.fromUri(this.currentFileUri))
			file.writeFromDataURL(this.canvas.toDataURL("image/png"));
		}
	else
		this.saveAsFile();
	}
CanImageUI.prototype.saveAsFile = function ()
	{
	if(this.editor)
		{
		var file = new ewkFile();
		if(file.fromUserCreation(this.localeProperties.getString('extensions.canimage@elitwork.com.save'),(this.currentFileUri?this.currentFileUri.replace(/(.+)\/(?:[^\/]+)/,'$1/'):''),(this.currentFileUri?this.currentFileUri.replace(/(?:.+)\/([^\/]+)/,'$1'):'image.png'),'*.png',this.localeProperties.getString('extensions.canimage@elitwork.com.file_filter')))
			file.writeFromDataURL(this.canvas.toDataURL("image/png"));
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.openFromImage = function (hEvent)
	{
	this.currentFileUri='';
	this.openImageEditor(hEvent.target.linkedImage);
	}
CanImageUI.prototype.sendToInput = function (hEvent)
	{
	if(this.editor)
		{
		var file = new ewkFile();
		if(file.fromTempDirectory(this.tempNum+'canimage.png'));
			file.writeFromDataURL(this.canvas.toDataURL("image/png"));
		hEvent.target.linkedInput.value=file.getUri();
		this.tempNum++;
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.sendToField = function (hEvent)
	{
	if(this.editor)
		{
		hEvent.target.linkedInput.value=this.canvas.toDataURL("image/png");
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.sendToClipboardBmp = function (hEvent)
	{
	if(this.editor)
		{
		var curDocument=window.parent.getBrowser().contentDocument;
		var image=curDocument.createElement('img');
		image.addEventListener('load',function() {
			var command='cmd_copyImageContents';
			var controller=document.commandDispatcher.getControllerForCommand(command);
			if(controller && controller.isCommandEnabled(command))
				{
				controller.doCommand(command);
				}
			this.parentNode.removeChild(this);
		},false);
		curDocument.lastChild.lastChild.appendChild(image);
		curDocument.popupNode=image;
		document.popupNode=image;
		image.src=this.canvas.toDataURL("image/png");
		/*
		var io         = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var channel    = io.newChannel(this.canvas.toDataURL("image/png"), null, null); 
		var input      = channel.open();
		alert(input.available());
		var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		trans.addDataFlavor("image/png");
		trans.setTransferData("image/png", input, input.available());

		var clipid = Components.interfaces.nsIClipboard;
		var clip   = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
		clip.setData(trans, null, clipid.kGlobalClipboard);*/
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.sendToClipboardB64 = function (hEvent)
	{
	if(this.editor)
		{
		const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
			.getService(Components.interfaces.nsIClipboardHelper);
		gClipboardHelper.copyString(this.canvas.toDataURL("image/png"));
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.sendToBBComposer = function (hEvent)
	{
	if(this.editor)
		{
		if(this.editorManager)
			{
			if(this.editorManager.focusedBBComposer)
				{
				var file = new ewkFile();
				if(file.fromTempDirectory(this.tempNum+'canimage.png'))
					{
					file.writeFromDataURL(this.canvas.toDataURL("image/png"));
					this.editorManager.focusedBBComposer.insertContent(this.editorManager.focusedBBComposer.importFiles(new Array(new File(file.file))));
					}
				this.tempNum++;
				}
			else
				alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_bbcomposer'));
			}
		else
			alert(this.localeProperties.getString('extensions.canimage@elitwork.com.install_bbcomposer'));
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
CanImageUI.prototype.sendToBBComposerB64 = function (hEvent)
	{
	if(this.editor)
		{
		if(this.editorManager)
			{
			if(this.editorManager.focusedBBComposer)
				this.editorManager.focusedBBComposer.toggleCommand('img',{'src':this.canvas.toDataURL("image/png")});
			else
				alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_bbcomposer'));
			}
		else
			alert(this.localeProperties.getString('extensions.canimage@elitwork.com.install_bbcomposer'));
		}
	else
		alert(this.localeProperties.getString('extensions.canimage@elitwork.com.no_image'));
	}
// Editor gestion functions
CanImageUI.prototype.reset = function (hEvent)
	{
	if(this.editor.image)
		this.editor=new CanImageEditor(this.editor.image,this);
	}
// Menupopups functions
CanImageUI.prototype.displayImagesMenupopup = function (hEvent)
	{
	var menupopup=hEvent.target;
	if(menupopup==document.getElementById('canImagePagePopup'))
		{
		while(menupopup.firstChild)
			menupopup.removeChild(menupopup.firstChild);
		for (var i = window.parent.gBrowser.browsers.length-1; i>=0; i--)
			{
			var browser = window.parent.gBrowser.getBrowserAtIndex(i);
			if(browser.contentDocument)
				{
				var j = browser.contentDocument.images.length-1;
				if(j>=0)
					{
					var menu = document.createElement('menu');
					var subMenupopup = document.createElement('menupopup');
					menu.setAttribute('label',browser.contentDocument.title);
					for (j; j>=0; j--)
						{
						var menuitem = document.createElement('menuitem');
						menuitem.setAttribute('label','#'+j+(browser.contentDocument.images[j].hasAttribute('alt')?' '+browser.contentDocument.images[j].getAttribute('alt'):''));
						menuitem.addEventListener('command', ewkLib.newEventHandler(this,this.openFromImage), false);
						menuitem.linkedImage=browser.contentDocument.images[j];
						subMenupopup.appendChild(menuitem);
						}
					menu.appendChild(subMenupopup);
					menupopup.appendChild(menu);
					}
				}
			}
		if(!menupopup.firstChild)
			{
			var menu = document.createElement('menuitem');
			menu.setAttribute('label',this.localeProperties.getString('extensions.canimage@elitwork.com.no_images_in_tabs'));
			menupopup.appendChild(menu);
			}
		}
	}

CanImageUI.prototype.displayInputsMenupopup = function (hEvent)
	{
	var menupopup=hEvent.target;
	if(menupopup==document.getElementById('canImageInputPopup'))
		{
		while(menupopup.firstChild)
			menupopup.removeChild(menupopup.firstChild);
		for (var i = window.parent.gBrowser.browsers.length-1; i>=0; i--)
			{
			var browser = window.parent.gBrowser.getBrowserAtIndex(i);
			if(browser.contentDocument)
				{
				var inputs=browser.contentDocument.getElementsByTagName('input');
				var keepedInputs=[];
				for(var j=inputs.length-1; j>=0; j--)
					{
					if(inputs[j].hasAttribute('type')&&inputs[j].getAttribute('type')=='file')
						keepedInputs.push(inputs[j]);
					}
				var j = keepedInputs.length-1;
				if(j>=0)
					{
					var menu = document.createElement('menu');
					var subMenupopup = document.createElement('menupopup');
					menu.setAttribute('label',browser.contentDocument.title);
					for (j; j>=0; j--)
						{
						var menuitem = document.createElement('menuitem');
						var label='';
						if(keepedInputs[j].hasAttribute('id'))
							{
							var labels=browser.contentDocument.getElementsByTagName('label');
							for(var k=labels.length-1; k>=0; k--)
								{
								if(labels[k].hasAttribute('for')&&labels[k].getAttribute('for')==keepedInputs[j].getAttribute('id'))
									{
									label=labels[k].textContent;
									}
								}
							}
						menuitem.setAttribute('label','#'+j+(label?' '+label:(keepedInputs[j].hasAttribute('name')?' '+keepedInputs[j].getAttribute('name'):'')));
						menuitem.addEventListener('command', ewkLib.newEventHandler(this,this.sendToInput), false);
						menuitem.linkedInput=keepedInputs[j];
						subMenupopup.appendChild(menuitem);
						}
					menu.appendChild(subMenupopup);
					menupopup.appendChild(menu);
					}
				}
			}
		if(!menupopup.firstChild)
			{
			var menuitem = document.createElement('menuitem');
			menuitem.setAttribute('label',this.localeProperties.getString('extensions.canimage@elitwork.com.no_inputs_in_tabs'));
			menupopup.appendChild(menuitem);
			}
		}
	}

CanImageUI.prototype.displayFieldsMenupopup = function (hEvent)
	{
	var menupopup=hEvent.target;
	if(menupopup==document.getElementById('canImageFieldPopup'))
		{
		while(menupopup.firstChild)
			menupopup.removeChild(menupopup.firstChild);
		for (var i = window.parent.gBrowser.browsers.length-1; i>=0; i--)
			{
			var browser = window.parent.gBrowser.getBrowserAtIndex(i);
			if(browser.contentDocument)
				{
				var inputs=browser.contentDocument.getElementsByTagName('input');
				var keepedInputs=[];
				for(var j=inputs.length-1; j>=0; j--)
					{
					if(inputs[j].hasAttribute('type')&&inputs[j].getAttribute('type')=='text')
						keepedInputs.push(inputs[j]);
					}
				var inputs=browser.contentDocument.getElementsByTagName('textarea');
				for(var j=inputs.length-1; j>=0; j--)
					{
					keepedInputs.push(inputs[j]);
					}
				var j = keepedInputs.length-1;
				if(j>=0)
					{
					var menu = document.createElement('menu');
					var subMenupopup = document.createElement('menupopup');
					menu.setAttribute('label',browser.contentDocument.title);
					for (j; j>=0; j--)
						{
						var menuitem = document.createElement('menuitem');
						var label='';
						if(keepedInputs[j].hasAttribute('id'))
							{
							var labels=browser.contentDocument.getElementsByTagName('label');
							for(var k=labels.length-1; k>=0; k--)
								{
								if(labels[k].hasAttribute('for')&&labels[k].getAttribute('for')==keepedInputs[j].getAttribute('id'))
									{
									label=labels[k].textContent;
									}
								}
							}
						menuitem.setAttribute('label','#'+j+(label?' '+label:(keepedInputs[j].hasAttribute('name')?' '+keepedInputs[j].getAttribute('name'):'')));
						menuitem.addEventListener('command', ewkLib.newEventHandler(this,this.sendToField), false);
						menuitem.linkedInput=keepedInputs[j];
						subMenupopup.appendChild(menuitem);
						}
					menu.appendChild(subMenupopup);
					menupopup.appendChild(menu);
					}
				}
			}
		if(!menupopup.firstChild)
			{
			var menuitem = document.createElement('menuitem');
			menuitem.setAttribute('label',this.localeProperties.getString('extensions.canimage@elitwork.com.no_fields_in_tabs'));
			menupopup.appendChild(menuitem);
			}
		}
	}
// Editor gestion functions
CanImageUI.prototype.openImageEditor = function (image)
	{
	if(image.nodeName.toLowerCase()=='img'||image.nodeName.toLowerCase()=='video')
		this.editor=new CanImageEditor(image,this);
	}

// CanImageEditor
function CanImageEditor(image,ui)
	{
	this.image=image;
	this.ui=ui;
	this.context=this.ui.canvas.getContext('2d');
	this.scale=1;
	this.brightness=1;
	this.contrast=0;
	this.hFlip=false;
	this.vFlip=false;
	this.degree=0;
	this.inverse=false;
	this.cropX=0;
	this.cropY=0;
	this.cropWidth=0;
	this.cropHeight=0;
	this.display();
	};
CanImageEditor.prototype.display = function ()
	{
	switch(this.degree)
		{
		case 0 :
		case 180 :
			this.ui.canvas.width=(this.cropWidth?this.cropWidth:this.image.width)*this.scale;
			this.ui.canvas.height=(this.cropHeight?this.cropHeight:this.image.height)*this.scale;
			break;
		case 90 :
		case 270 :
			this.ui.canvas.width=(this.cropHeight?this.cropHeight:this.image.height)*this.scale;
			this.ui.canvas.height=(this.cropWidth?this.cropWidth:this.image.width)*this.scale;
			break;
		}
	this.context.scale((this.hFlip?-1:1),(this.vFlip?-1:1));
	this.context.translate((this.hFlip?-this.ui.canvas.width:0),(this.vFlip?-this.ui.canvas.height:0));
	this.context.rotate(this.degree * Math.PI / 180);
	switch(this.degree)
		{
		case 0 :
			this.context.drawImage(this.image, this.cropX, this.cropY, (this.cropWidth?this.cropWidth:this.image.width), (this.cropHeight?this.cropHeight:this.image.height), 0, 0, (this.cropWidth?this.cropWidth:this.image.width)*this.scale, (this.cropHeight?this.cropHeight:this.image.height)*this.scale);
			break;
		case 90 :
			this.context.translate(0, -this.image.height*this.scale);
			this.context.drawImage(this.image, this.cropX, this.cropY, (this.cropWidth?this.cropWidth:this.image.width), (this.cropHeight?this.cropHeight:this.image.height), 0, 0, (this.cropWidth?this.cropWidth:this.image.width)*this.scale, (this.cropHeight?this.cropHeight:this.image.height)*this.scale);
			break;
		case 180 :
			this.context.translate(-this.image.width*this.scale, -this.image.height*this.scale);
			this.context.drawImage(this.image, this.cropX, this.cropY, (this.cropWidth?this.cropWidth:this.image.width), (this.cropHeight?this.cropHeight:this.image.height), 0,0, (this.cropWidth?this.cropWidth:this.image.width)*this.scale, (this.cropHeight?this.cropHeight:this.image.height)*this.scale);
			break;
		case 270 :
			this.context.translate(-this.image.width*this.scale, 0);
			this.context.drawImage(this.image, this.cropX, this.cropY, (this.cropWidth?this.cropWidth:this.image.width), (this.cropHeight?this.cropHeight:this.image.height), 0, 0, (this.cropWidth?this.cropWidth:this.image.width)*this.scale, (this.cropHeight?this.cropHeight:this.image.height)*this.scale);
			break;
		}
	if(this.brightness!=1||this.contrast!=1||this.inverse)
		{
		var imgData=this.context.getImageData(0,0,this.ui.canvas.width,this.ui.canvas.height);
		var nPixels=imgData.width*imgData.height;
		for(var i=0; i<nPixels; i++)
			{
			var r=i*4, g=r+1, b=r+2;
			var m=(imgData.data[r]+imgData.data[g]+imgData.data[b])/3;
			var rV=(imgData.data[r]-((m-imgData.data[r])*this.contrast))*this.brightness;
			if(rV>255)
				rV=255;
			else if(rV<0)
				rV=0;
			var gV=(imgData.data[g]-((m-imgData.data[g])*this.contrast))*this.brightness;
			if(gV>255)
				gV=255;
			else if(gV<0)
				gV=0;
			var bV=(imgData.data[b]-((m-imgData.data[b])*this.contrast))*this.brightness;
			if(bV>255)
				bV=255;
			else if(bV<0)
				bV=0;
			if(this.inverse)
				{
				rV=255-rV;
				gV=255-gV;
				bV=255-bV;
				}
			imgData.data[r]=rV;
			imgData.data[g]=gV;
			imgData.data[b]=bV;
			}
		this.context.putImageData(imgData,0,0);
		}
	this.ui.update();
	}
CanImageEditor.prototype.rotateRight = function ()
	{
	this.degree+=90;
	if(this.degree==360)
		this.degree=0;
	this.display();
	}
CanImageEditor.prototype.rotateLeft = function ()
	{
	if(this.degree==0)
		this.degree=360;
	this.degree-=90;
	this.display();
	}
CanImageEditor.prototype.horizontalFlip = function ()
	{
	this.hFlip=!this.hFlip;
	this.display();
	}
CanImageEditor.prototype.verticalFlip = function ()
	{
	this.vFlip=!this.vFlip;
	this.display();
	}
CanImageEditor.prototype.zoomIn = function ()
	{
	//if(this.scale<0)
		this.scale+=0.1;
	//else
	//	this.scale+=1;
	this.display();
	}
CanImageEditor.prototype.zoomOut = function ()
	{
	//if(this.scale<=1)
		this.scale-=0.1;
	//else
	//	this.scale-=1;
	this.display();
	}
CanImageEditor.prototype.lessBrightness = function ()
	{
	if(this.brightness>0)
		{
		this.brightness-=0.05;
		this.display();
		}
	}
CanImageEditor.prototype.moreBrightness = function ()
	{
	if(this.brightness<2)
		{
		this.brightness+=0.05;
		this.display();
		}
	}
CanImageEditor.prototype.lessContrast = function ()
	{
	if(this.contrast>-3)
		{
		this.contrast-=0.1;
		this.display();
		}
	}
CanImageEditor.prototype.moreContrast = function ()
	{
	if(this.contrast<3)
		{
		this.contrast+=0.1;
		this.display();
		}
	}
CanImageEditor.prototype.inverseColors = function ()
	{
	if(this.inverse)
		{
		this.inverse=false;
		}
	else
		{
		this.inverse=true;
		}
	this.display();
	}
CanImageEditor.prototype.cropZone = function (rect)
	{
	this.cropX=0;
	this.cropY=0;
	this.cropWidth=0;
	this.cropHeight=0;
	this.display();
	this.ui.getSelection(ewkLib.newEventHandler(this,this.handleCropZone));
	}
CanImageEditor.prototype.handleCropZone = function (xFactor,yFactor,widthFactor,heightFactor)
	{
	this.cropX=(this.ui.canvas.width/this.scale)*xFactor;
	this.cropY=(this.ui.canvas.height/this.scale)*yFactor;
	this.cropWidth=(this.ui.canvas.width/this.scale)*widthFactor;
	this.cropHeight=(this.ui.canvas.height/this.scale)*heightFactor;
	this.display();
	}

// Go !
var canImageUI=new CanImageUI();