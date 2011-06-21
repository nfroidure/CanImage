function canImageContextDisplay()
	{
	var contextMenuitem=document.getElementById('canimage-context');
	var contextBgMenuitem=document.getElementById('canimage-bg-context');
	var contextLinkMenuitem=document.getElementById('canimage-link-context');
	if(gContextMenu&&(gContextMenu.onImage||gContextMenu.onCanvas||gContextMenu.onVideo))
		{
		contextMenuitem.disabled=false;
		contextMenuitem.hidden=false;
		}
	else
		{
		contextMenuitem.disabled=true;
		contextMenuitem.hidden=true;
		}
	if(gContextMenu&&gContextMenu.hasBGImage&&gContextMenu.bgImageURL)
		{
		contextBgMenuitem.disabled=false;
		contextBgMenuitem.hidden=false;
		}
	else
		{
		contextBgMenuitem.disabled=true;
		contextBgMenuitem.hidden=true;
		}
	if(gContextMenu&&gContextMenu.onLink&&gContextMenu.onSaveableLink&&gContextMenu.linkURL&&/(.+)\.(gif|png|jpg|jpeg)/i.test(gContextMenu.linkURL))
		{
		contextLinkMenuitem.disabled=false;
		contextLinkMenuitem.hidden=false;
		}
	else
		{
		contextLinkMenuitem.disabled=true;
		contextLinkMenuitem.hidden=true;
		}
	}
function canImageContextEdit(type)
	{
	canImageSelType=type;
	switch(type)
		{
		case 'bg':
			canImageCurSel=gContextMenu.bgImageURL;
		break;
		case 'link':
			canImageCurSel=gContextMenu.linkURL;
		break;
		default:
			canImageCurSel=gContextMenu.target;
		break;
		}
	var sidebar = document.getElementById("sidebar");
	if(sidebar&&sidebar.contentWindow&&sidebar.contentWindow.canImageUI)
		{
		sidebar.contentWindow.canImageUI.openFromContextMenu();
		}
	else
		{
		toggleSidebar('bbcomp-canimage-sidebar', true);
		}
	}
var canImageSelType;
var canImageCurSel;