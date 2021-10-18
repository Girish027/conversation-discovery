
export const customTextarea = {
  marginTop: '20px',
  label: {
    color: '#6E6E6E',
    fontSize: '14px',
    fontWeight: 'normal',
    paddingBottom: '5px'
  },
  field: {
    width: '99%'
  },
};

export const customTextField = {
  marginTop: '20px',
  label: {
    fontSize: '14px',
    color: '#6E6E6E',
    letterSpacing: 0,
    textAlign: 'left',
    paddingBottom: '5px'
  },
  field: {
    background: '#FFFFFF',
    border: '0px solid #DCE1E8',
    borderRadius: '2px',
    width: '99%',
    input: {
      fontSize: '14px',
      letterSpacing: 0,
      textAlign: 'left'
    }
  }
};

export const customUpDown = {
  marginTop: '20px',
  label: {
    color: '#6E6E6E',
    fontSize: '14px',
    fontWeight: 'normal',
    paddingBottom: '5px',
    letterSpacing: 0,
    textAlign: 'left'
  },
  field: {
    width: '100%',
    border: '1px solid #DCE1E8',
    borderRadius: '0 2px 2px 0',
    paddingLeft: '5px',
    lineHeight: '25px',
    display: 'block'
  }
};

export const validationErrorStyle = {
  icon: {
    height: '0.7em',
  },
  field: {
    fontSize: '13px',
    color: 'red'
  },
};

export const styles = {
  dialog: {
    container: {
      background: '#FAFAFA',
      maxWidth: '600px',
      display: 'grid',
      gridTemplateRows: '60px auto 60px',
    },
    childContainer: {
      marginTop: '20px',
      marginBottom: '10px',
    },
    content: {
      maxWidth: '560px',
      maxHeight: '500px',
      left: 'calc((110vw - 600px) / 2)'
    },
    header: {
      title: {
        marginTop: '20px',
        marginLeft: '20px',
        fontSize: '20px',
      },
    },
    footer: {
      display: 'flex',
      borderTop: '1px solid',
      paddingTop: '12px',
      paddingBottom: '22px',
      paddingRight: '20px',
      paddingLeft: '20px'
    },
  },
  text: {
    textAlign: 'left',
    paddingTop: '10px',
    lineHeight: '18px',
    color: '#313f54',
  },
  card: {
    width: '202px',
    margin: 'auto',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '3px',
    boxShadow: '2px 2px 5px #0000001A',
    boxSizing: 'border-box',
    background: '#FFFFFF 0% 0% no-repeat padding-box',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '18px',
    color: '#313f54',
    paddingTop: '15px',
    paddingBottom: '10px',
  },
  icon: {
    height: '80px',
    width: '122px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};
