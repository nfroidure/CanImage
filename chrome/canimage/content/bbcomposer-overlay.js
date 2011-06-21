bbcManager.prototype.canimageDisplay = function ()
	{
	var curElement = this.focusedBBComposer.getSelectedElement();
	if(curElement.nodeName.toLowerCase()=='img')
		this.sidebar.contentWindow.canImageUI.openImageEditor(curElement);
	}