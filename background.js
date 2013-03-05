chrome.extension.onMessage.addListener(

function(request, sender, onChange) {
	checkCustomCommands(request.command);
});

function checkCustomCommands(value) {
	var db = window.localStorage;
	var aComp;
	var wComp;
	for (var i = 0, l = db.length; i < l; i++) {
		aComp = db.key(i).substring(0, db.key(i).indexOf(' '));
		wComp = db.key(i).substring(db.key(i).indexOf(' ') + 1);
		if (aComp == value) {
			chrome.tabs.create({
				"url": wComp
			});
			return 0;
		}
	}
	decide_command(value);
}

function getAppId(value, task) {
	chrome.management.getAll(function(results) {
		for (var i = 0; i < results.length; i++) {
			if (results[i].name.toLowerCase().indexOf(value) >= 0) {
				id = results[i].id;
				break;
			}
		}
		if (task == "disable") disableApp(id);
		else if (task == "enable") enableApp(id);
		else if (task == "uninstall") uninstallApp(id);
		else if (task == "launch") launchApp(id);
	});
}

function disableApp(id) {
	if (id !== '') {
		chrome.management.setEnabled(id, false);
	}
}

function enableApp(id) {
	if (id !== '') {
		chrome.management.setEnabled(id, true);
	}
}

function uninstallApp(id) {
	var r = confirm("Are you sure you want to uninstall" + value + "?");
	if (r === true) {
		chrome.management.uninstall(id);
	}
}

function launchApp(id) {
	chrome.management.getAll(function(result) {
		if (id !== '') chrome.management.launchApp(id);
		else alert("extension or app does not exist");
	});
}

function decide_command(value) {
	if (value.indexOf("open") >= 0 || value.indexOf("new") >= 0 || value.indexOf("edit") >= 0) {
		if (value.indexOf("map") >= 0 || value.indexOf("directions") >= 0 || value.indexOf("near") >= 0) {
			if (value.indexOf("map of") >= 0) {
				value = value.substring(value.indexOf("of") + 3);
				value = "http://maps.google.com/maps?q=" + value;
				chrome.tabs.create({
					"url": value
				});
			} else if (value.indexOf("get") >= 0 && value.indexOf("near") >= 0) {
				var v = value.substring((value.indexOf("get") + 4), value.indexOf("near"));
				var n = value.substring(value.indexOf("near") + 5);
				value = "http://maps.google.com/maps?q=" + v + "near=" + n;
				chrome.tabs.create({
					"url": value
				});
			} else if (value.indexOf("get directions from") >= 0) {
				var v = value.substring((value.indexOf("from") + 5), value.indexOf("to"));
				value = "http://maps.google.com/?saddr=" + v + "&daddr=" + value.substring(value.indexOf("to") + 3);
				chrome.tabs.create({
					"url": value
				});
			}
		} else {
			if (value == "open new tab" || value == "new tab") {
				chrome.tabs.create({});
			} else if (value == "open new window" || value == "new window") {
				chrome.windows.create();
			} else if (value == "open incognito window") {
				chrome.windows.create({
					"incognito": true
				});
			} else if (value.indexOf("open website") >= 0) {
				if (value.indexOf("in new tab") >= 0) {
					value = value.substring(value.indexOf("tab") + 4);
					if (value.indexOf("http://") < 0) value = "http://" + value;
					chrome.tabs.create({
						"url": value
					});
				} else if (value.indexOf("in new window") >= 0) {
					value = value.substring(value.indexOf("window") + 7);
					if (value.indexOf("http://") < 0) value = "http://" + value;
					chrome.windows.create({
						"url": value
					});
				}
			} else if (value == "open tab in new window" || value == "open tabs in new window") {
				chrome.windows.getLastFocused(function(w) {
					chrome.tabs.getSelected(w.id, function(t) {
						chrome.windows.create({
							"tabId": t.id
						});
					});
				});
			} else if (value == "open settings" || value == "open options" || value == "edit settings" || value == "edit options") chrome.tabs.create({
				"url": "chrome://settings/browser"
			});
			else if (value == "open history") chrome.tabs.create({
				"url": "chrome://history/"
			});
		}
	} else if (value.indexOf("close") >= 0) {
		if (value == "close tab") {
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.getSelected(w.id, function(t) {
					chrome.tabs.remove(t.id);
				});
			});
		} else if (value == "close window") {
			chrome.windows.getLastFocused(function(w) {
				chrome.windows.remove(w.id);
			});
		}
	} else if (value.indexOf("translate") >= 0) {
		var array = new Array("afrikaans", "af", "albanian", "sq", "arabic", "ar", "belarusian", "be", "bulgarian", "bg", "catalan", "ca", "chinese", "zh", "chinese simplified", "zh-CN", "chinese traditional", "zh-TW", "croation", "hr", "czech", "cs", "danish", "da", "dutch", "nl", "english", "en", "estonian", "et", "filipino", "tl", "finnish", "fi", "french", "fr", "galician", "gl", "german", "de", "greek", "el", "haitian creole", "ht", "hebrew", "iw", "hindi", "hi", "hungarian", "hu", "icelandic", "is", "indonesian", "id", "irish", "ga", "italian", "it", "japanese", "ja", "korean", "ko", "latvian", "lv", "lithuanian", "lt", "macedonian", "mk", "malay", "ms", "maltese", "mt", "norwegian", "no", "persian", "fa", "polish", "pl", "portuguese", "pt", "portuguese portugal", "pt-PT", "romanian", "ro", "russian", "ru", "serbian", "sr", "slovak", "sk", "slovenian", "sl", "spanish", "es", "swahili", "sw", "swedish", "sv", "tagalog", "tl", "thai", "th", "turkish", "tr", "ukrainian", "uk", "vietnamese", "vi", "welsh", "cy", "yiddish", "yi");
		value = value.substring(value.indexOf("translate") + 10);
		lang = value.substring(value.lastIndexOf(" to ") + 4);
		value = value.substring(0, value.lastIndexOf(" to "));
		for (var a = 0; a < array.length; a += 2) {
			if (array[a] == lang) {
				value = "http://translate.google.com/#auto|" + array[a + 1] + "|" + value;
				chrome.tabs.create({
					"url": value
				});
			}
		}
	} else {
		if (value == "manage extensions") chrome.tabs.create({
			"url": "chrome://extensions"
		});
		else if (value == "store tab") {
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.getSelected(w.id, function(t) {
					chrome.tabs.update(t.id, {
						"pinned": true
					});
				});
			});
		} else if (value == "remove stored tab") {
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.getSelected(w.id, function(t) {
					chrome.tabs.update(t.id, {
						"pinned": false
					});
				});
			});
		} else if (value == "delete history") {
			chrome.history.deleteAll(function() {});
		} else if (value.indexOf("delete") >= 0 && value.indexOf("from history") >= 0) {
			value = value.substring(value.indexOf("delete") + 7, value.indexOf("from history"));
			value = "http://www." + value;
			chrome.history.deleteURL({
				"url": value
			});
		} else if (value.indexOf("search") >= 0) {
			value = value.substring(value.indexOf("search") + 7);
			value = "http://google.com/search?as_q=" + value;
			chrome.tabs.create({
				"url": value
			});
		} else if (value.indexOf("go to") >= 0) {
			value = value.substring(value.indexOf("go to") + 6);
			if (value.indexOf("http://") < 0) value = "http://" + value;
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.getSelected(w.id, function(t) {
					chrome.tabs.update(t.id, {
						"url": value
					});
				});
			});
		} else if (value.indexOf("goto") >= 0) {
			value = value.substring(value.indexOf("goto") + 5);
			if (value.indexOf("http://") < 0) value = "http://" + value;
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.getSelected(w.id, function(t) {
					chrome.tabs.update(t.id, {
						"url": value
					});
				});
			});
		} else if (value.indexOf("launch") >= 0) {
			value = value.substring(value.indexOf("launch") + 7);
			getAppId(value, "launch");
		} else if (value.indexOf("disable") >= 0) {
			value = value.substring(value.indexOf("disable") + 8);
			getAppId(value, "disable");
		} else if (value.indexOf("enable") >= 0) {
			value = value.substring(value.indexOf("enable") + 7);
			getAppId(value, "enable");
		} else if (value.indexOf("uninstall") >= 0) {
			value = value.substring(value.indexOf("uninstall") + 10);
			getAppId(value, "uninstall");
		} else if (value.indexOf("options page") >= 0) {
			value = value.substring(0, value.indexOf("options page"));
			var options;
			chrome.management.getAll(function(results) {
				for (var i = 0; i < results.length; i++) {
					if (results[i].name.toLowerCase().indexOf(value) >= 0) {
						options = results[i].optionsUrl;
						break;
					}
				}
			});
			chrome.windows.getLastFocused(function(w) {
				chrome.tabs.create(w.id, {
					"url": options
				});
			});
		} else if (value == "clear browsing data") chrome.tabs.create({
			"url": "chrome://settings/clearBrowserData"
		});
		else if (value.indexOf(".com") >= 0) {
			value = "http://" + value;
			chrome.tabs.create({
				"url": value
			});
		} 
        else if (value.toLowerCase() == "facebook") chrome.tabs.create({
			"url": "http://www.facebook.com/"
		});
		else if (value.toLowerCase() == "google") chrome.tabs.create({
			"url": "http://www.google.com/"
		});
		else if (value.toLowerCase() == "yahoo") chrome.tabs.create({
			"url": "http://www.yahoo.com/"
		});
		else if (value.toLowerCase() == "twitter") chrome.tabs.create({
			"url": "http://www.twitter.com/"
		});
		else if (value.toLowerCase() == "flicker" || value == "flickr") chrome.tabs.create({
			"url": "http://www.flickr.com/"
		});
		else if (value.toLowerCase() == "msn") chrome.tabs.create({
			"url": "http://www.msn.com/"
		});
		else if (value.toLowerCase() == "hotmail") chrome.tabs.create({
			"url": "http://www.hotmail.com/"
		});
		else if (value.toLowerCase() == "dig" || value == "digg") chrome.tabs.create({
			"url": "http://www.digg.com/"
		});
	}
}