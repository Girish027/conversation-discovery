export const fonts = ['Lato', 'arial', 'sans-serif'];

export const heights = {
  navBar: '40px',
  pageHeader: '90px',
  actionBar: '67px',
};
export const colors = {
  darkText: '#313F54',
  disabledText: '#9B9B9B',
  lightText: '#a7a9af',
  border: '#DADADD',
  headerBackground: '#F6F7F8',
  orange: '#EF8822',
  darkOrange: '#bf6c1b',
  navy: '#313f54',
  prussianBlue: '#003467',
  cobalt: '#004c97',
  focusItem: '#f3f4f5',
  selectedItem: '#eee',
  white: '#fff',
};

export const margins = {
  side: '30px',
  top: '40px',
  toolItem: '10px'
};

export const fontSize = {
  header: '20px',
  subHeader: '0.9em',
  text: '13px'
};

export const common = {
  homepageDivider: {
    padding: '0 0px 10px 25px'
  },
  subHeader: {
    fontSize: '0.9em',
    fontFamily: fonts,
    color: colors.lightText,
  },
  icon: {
    display: 'flex',
  }
};

export const dialogStyles = {
  top: '20%',
  cancel: {
    backgroundColor: 'unset',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  ok: {
    marginLeft: '10px',
    paddingLeft: '25px',
    paddingRight: '25px',
  },
};

export const modalErrorLayout = {
  border: '1px solid #C81919',
  padding: '10px',
  backgroundColor: '#FFFFD1',
  fontSize: '15px',
  color: '#C81919',
  borderRadius: '3px'
};

export const toolTipStyle = {
  width: 'max-content'
};

export const stopwordsStyle = {
  label: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#6E6E6E',
    letterSpacing: 0,
    textAlign: 'left',
    paddingBottom: '10px'
  },
  filedIcon: {
    position: 'absolute',
    right: 0,
    padding: '10px',
    zIndex: 1
  },
  field: {
    background: '#FFFFFF',
    border: '0px solid #DCE1E8',
    borderRadius: '2px',
    width: '240%',
    input: {
      fontSize: '14px',
      letterSpacing: 0,
      textAlign: 'left'
    }
  },
  stopWordsWrap: {
    marginTop: '15px', display: 'flex', flexWrap: 'wrap'
  },
  tagStyle: {
    color: '#4A4A4A',
    fontSize: '16px',
    maxHeight: '40px',
    backgroundColor: '#f3f4f5',
    borderRadius: '2px',
    marginRight: '10px',
    marginBottom: '10px',
  },
  pillStyle: {
    padding: '12px 12px 12px 14px',
    width: 'max-content'
  },
  visibleStyle: {
    visibility: 'visible',
    position: 'relative'
  },
  hiddenStyle: {
    visibility: 'hidden',
    position: 'absolute'
  }

};

export const searchBarStyle = {
  paddingTop: '10px',
  paddingLeft: '31px',
  display: 'flex',

  searchIcon: {
    position: 'absolute',
    zIndex: 1,
    padding: '12px 10px'
  },

  textFieldContainerStyle: {
    width: '90%',
    // marginRight: '30px'
  },

  textFieldStyle: {
    input: {
      paddingLeft: '30px',
    },
    width: '13vw',
  },

  clearIcon: {
    position: 'relative',
    // zIndex: 1,
    right: 30,
    // top: 11
  }
};

export const clusterListStyle = {
  color: '#313F54',
  headerStyle: {
    padding: '25px 0px 0px 20px',
    marginBottom: '18px',
    fontWeight: 'bold',
  },
  headerTopicStyle: {
    fontSize: '14px',
    paddingLeft: '10px'
  },
  seperatorStyle: {
    float: 'right',
    marginRight: '23px',
  },
  topicStyle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '14vw',
    marginRight: '100px',
  },
  headerButtonStyle: {
    height: 'unset',
    fontSize: '13px',
    paddingRight: '5px',
    color: '#313F54',
    ':hover': {
      color: '#8698b8',
    }
  },
  ulStyle: {
    listStyleType: 'none',
    paddingLeft: '8px',
    margin: '0px',
    height: 'calc(100vh - 220px)',
    overflow: 'auto',
    color: 'rgb(49, 63, 84)',
    fontSize: '13px',
  },
  outerListStyle: {
    padding: '10px 0px 10px 10px',
  },
  innerListStyle: {
    display: 'block',
    height: '16px',
    padding: '10px 0px 10px 22px',
    paddingRight: 0,
    cursor: 'pointer',
  },
  innerListStyleHover: {
    display: 'block',
    height: '16px',
    padding: '10px 0px 10px 22px',
    paddingRight: 0,
    cursor: 'pointer',
    color: '#1175E2',
  },
  selectedItem: {
    color: '#313f54',
    backgroundColor: '#dbeafb',
    display: 'block',
    height: '16px',
    padding: '10px 0px 10px 16px',
    paddingRight: 0,
    outline: 'none',
    cursor: 'pointer',
    borderLeft: '6px solid #1175E2'
  },
  innerLabel: {
    minWidth: '100px',
    float: 'left',
    width: '75%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lineStyle: {
    height: '2px',
    borderWidth: '0',
    backgroundColor: 'rgb(246, 247, 248)',
  },
  hoverStyle: {
    color: '#EF8822',
  },
  innerSeperatorStyle: {
    float: 'right',
    marginRight: '23px',
    // marginTop: '-12px',
  },
  triggerStyle: {
    fontWeight: 'bold'
  }
};

export const sidebarButtonStyle = {
  containerStyle: {
    border: 'unset',
    fontWeight: 'bold',
    height: '45px'
  },
};

export const runOverviewStyle = {
  completeButton: {
    marginTop: '-15px',
    fontWeight: '400',
    fontSize: '12px',
    padding: '0px 10px',
    letterSpacing: '0.07em'
  },
  uploadYourTranscripts: {
    marginTop: '-15px',
    fontWeight: '400',
    fontSize: '10px',
    padding: '0px 10px',
    letterSpacing: '0.0em'
  },
  graphStyle: {
    container: {
      margin: '0px 3px',
      display: 'flex',
      flexDirection: 'row'
    },
    topPane: {
      // width: '60%'
    },
    bottomPane: {
      position: 'relative',
      padding: '85px 10px 10px 10px',
      overflowWrap: 'anywhere',
    },
    // take up the remaining height
    height: `calc(100vh - ${heights.navBar} - ${heights.pageHeader} - ${heights.actionBar} - 10px)`,
    width: '50vw',
  }
};

export const popoverContainerStyle = {
  padding: '25px',
  left: '300px',
  backgroundColor: 'white',
  width: 'auto',
  height: 'auto',
  display: 'flex',
  color: 'black',
  fontWeight: 100,
  fontSize: '13px',
  userSelect: 'none',
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
};

export const filterPopupStyle = {

  filterTopContainer: {
    display: 'inline-flex', paddingBottom: '5px'
  },
  filterSimilarity: {
    display: 'flex', paddingBottom: '5px'
  },
  textboxStyle: {
    marginLeft: '10px',
    width: '50px',
    input: {
      height: '25px',
    }
  },
  dropdownStyle: {
    dropdownContainer: {
      float: 'unset', marginLeft: '10px', paddingTop: '6px'
    }
  }
};

export const removedConversation = {
  containerStyle:
{ padding: '10px 30px 0px 20px', color: '#313F54' },
  labelStyle: {
    paddingLeft: '5px'
  },
  countStyle: {
    float: 'right'
  }
};

export const clusterAction = {

  renameIconLabel: {
    padding: '0px 30px',
    display: 'block',
    height: '60px',

    children: {
      padding: '11px 10px 9px 0px',
    },

    rootClusterName: {
      // color: '#313F54',
      fontSize: '14px',
      fontWeight: 'normal',
      cursor: 'pointer',
      color: '#ef8822',
    },

    clusterName: {
      color: '#000000D9',
      fontSize: '16px',
      fontWeight: 'bold',
      paddingTop: '5px',
    }
  },

  quickSearchHeader: {
    padding: '0px 30px 0px 0px',
    display: 'block',
    height: '50px',
    borderTop: '1px solid #dadadd',

    children: {
      padding: '5px 10px 9px 0px',
    },

    rootClusterName: {
      // color: '#313F54',
      fontSize: '14px',
      fontWeight: 'normal',
      cursor: 'pointer',
      color: '#ef8822',
      display: 'flex',
      float: 'left',
      maxWidth: '82%',
    },

    clusterName: {
      color: '#000000D9',
      fontSize: '16px',
      fontWeight: 'bold',
      paddingTop: '5px',
    }
  },

  buttons: {
    lastChild: {
      marginRight: 0,
      marginLeft: '20px',
      padding: '0px 27px',
    }
  },

  modeSwitch: {
    width: '194px',
    height: '38px',
    background: '#F4F4F4 0% 0% no-repeat padding-box',
    opacity: 1,
    marginLeft: '20px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    fontSize: '12px',
    fontWeight: 'normal',

    off: {
      cursor: 'pointer',
      fontWeight: 'normal',
      color: '#00000099',
    },

    on: {
      background: '#FFFFFF 0% 0% no-repeat padding-box',
      boxShadow: '0px 0px 5px #00000017',
      border: '0.5px solid #E8E8E8',
      opacity: 1,
      fontWeight: 'bold',
      color: '#000000',
    },

    conversations: {
      margin: '7px 5px 7px 10px',
      padding: '0px',
      width: '96px',
      height: '24px',
    },

    answers: {
      margin: '7px 10px 7px 5px',
      padding: '0px',
      width: '68px',
      height: '24px',
    },
  },
};

export const KeywordsSearchBarStyle = {
  filterKeywordLabel: {
    display: 'inline-block',
    fontSize: '13px',
    fontFamily: 'Lato',
    color: 'rgb(158, 158, 158)',
    paddingTop: '6px',
    paddingLeft: '30px',
  },

  actionBar: {
    borderTop: '0px',
    borderBottom: '0px',
    height: '40px',
    marginBottom: '10px',
    paddingLeft: '20px',
  },

  searchActionItem: {
    marginTop: '-14px',
    paddingRight: '0px',
  },

  separatorActionItem: {
    marginTop: '10px',
    color: '#C4C4C4',
    paddingLeft: '10px',
  },

  wordActionItem: {
    marginTop: '10px',
    fontSize: '14px',
    fontFamily: 'Lato',
    paddingLeft: '10px'
  },

  DropDownActionItem: {
    marginTop: '12px',
    fontSize: '14px',
    fontFamily: 'Lato',
    paddingLeft: '10px'
  },
};

export const addToBotDialog = {

  label: {
    color: '#6E6E6E', fontSize: '14px'
  },

  divLabel: {
    marginBottom: '10px'
  },

  spanLabel: {
    marginBottom: '20px', fontSize: '12px', color: '#6E6E6E', fontFamily: 'Lato', fontWeight: 'bold'
  },

  spanLabelItalics: {
    marginBottom: '20px', fontSize: '12px', color: '#6E6E6E', fontFamily: 'Lato', fontWeight: 'bold', fontStyle: 'italic'
  },

  comboBoxContainer: {
    marginBottom: '20px'
  }
};

export const addToFaqDialog = {

  contentLabel: {
    color: '#6E6E6E', fontSize: '14px', marginBottom: '15px'
  },
  label: {
    color: '#6E6E6E', fontSize: '14px', marginBottom: '15px', marginTop: '20px'
  },
  divLabel: {
    marginBottom: '10px'
  },

  spanLabel: {
    marginBottom: '20px', fontSize: '12px', color: '#6E6E6E', fontFamily: 'Lato', fontWeight: 'bold'
  },

  spanLabelItalics: {
    marginBottom: '20px', fontSize: '12px', color: '#6E6E6E', fontFamily: 'Lato', fontWeight: 'bold', fontStyle: 'italic'
  },

  comboBoxContainer: {
    marginBottom: '20px'
  }
};

export const conversationButtonStyle = {
  textDecoration: 'none',
  color: '#313f54',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  paddingLeft: '0px',
  cursor: 'pointer',
};

export const conversationTableCheckBoxEnableStyle = {
  paddingLeft: '10px', marginTop: '5px'
};

export const conversationTableCheckBoxDisableStyle = {
  paddingLeft: '10px', marginTop: '5px', pointerEvents: 'none'
};

export const previewStyle = {
  height: '410px',
  width: '300px',
  zIndex: 10,
  position: 'fixed',
  bottom: 0,
  right: '15px'
};

export const windowStyleTopicDistributionView = {
  minWidth: '700px'
};

export const windowStyleConversationView = {
  minWidth: '800px',
  height: '110px'
};
