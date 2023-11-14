class Modal {
  #fensterActive = false;
  #scrollPosition = 0;

  constructor(props) {
    this._modalAttrName = 'data-modalOchka';
    this._fensterAttrName = 'fenster';
    this._closeBtnAttrName = 'close';
    this._pictureContainerAttrName = 'picture';

    const modalConfigs = {
      modalType: 'picture',
      protoAttrName: '',
      linkAttrName: '',
      modalStyle: 'modal',
      //  shadow configs:
      shadow: false,
      shadowStyle: 'modal__shadow',
      //  fenster configs:
      fensterStyle: 'modal__fenster',
    };

    const fensterConfigs = {
      header: {
        tag: '',
        style: '',
        content: '',
        customContent: '',
      },
      title: {
        tag: '',
        style: '',
        content: '',
        customContent: '',
      },
      closeButton: {
        tag: 'button',
        style: 'modal__close-btn',
        customContent: '',
      },
      content: {
        tag: '',
        style: '',
        content: '',
        customContent: '',
      },
      footer: {
        tag: '',
        style: '',
        content: '',
        customContent: '',
      },
      picture: {
        tag: 'div',
        style: 'modal__picture',
      },
    };

    this.config = Object.assign(modalConfigs, fensterConfigs, props);

    window.addEventListener('load', () => {
      this.prelaunchCheck();
      document.querySelector('body').appendChild(this.createFenster());
      this.createShadow();
      this.eventHandler();
    });
  }

  //prelaunch function to handle errors with properties:
  prelaunchCheck() {
    const { ...configs } = this.config;

    function showEmptyError(prop, message) {
      console.error(
        `modalOchka: ${prop} can not be empty. ${prop} provides ${message}`,
      );
    }

    if (
      this._modalAttrName !== 'data-modalOchka' ||
      this._fensterAttrName !== 'fenster' ||
      this._closeBtnAttrName !== 'close' ||
      this._pictureContainerAttrName !== 'picture'
    ) {
      console.warn(
        `modalOchka: It is highly unrecommended to change protected properties and methods`,
      );
    }

    if (configs.protoAttrName == false) {
      showEmptyError('protoAttrName', 'creation of modal prototype');
    }

    if (configs.linkAttrName == false) {
      showEmptyError(
        'linkAttrName',
        'creating eventButtton to open modal window',
      );
    }
  }

  createElement(tagName, className, textContent) {
    let element;

    if (!tagName) {
      return false;
    } else {
      //quite conversative idea, perhaps I had to add new Error ('it can not include symbol "" ')
      element = document.createElement(tagName.trim().replace(' ', ''));
    }

    if (className) {
      const strings = className.trim().split(' ');
      const classes = strings.filter((string) => string !== '');
      classes.forEach((cssClass) => element.classList.add(cssClass));
    }

    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  createCustomElement(object) {
    const container = this.createElement(
      object.tag,
      object.style,
      object.content,
    );

    if (container && object.customContent) {
      container.innerHTML = object.customContent;
    }

    return container;
  }

  createFenster() {
    const { ...configs } = this.config;
    const modal = this.createElement('div', configs.modalStyle);
    modal.setAttribute(this._modalAttrName, configs.protoAttrName);
    const fenster = this.createElement('div', configs.fensterStyle);
    fenster.setAttribute(this._modalAttrName, this._fensterAttrName);
    modal.appendChild(fenster);
    // auxilary func to controll append/prepend elements:
    const checkIsExist = (container, elem) => {
      if (container && elem) {
        container.appendChild(elem);
      }
    };
    const createButton = () => {
      const { ...configs } = this.config.closeButton;

      if (configs.tag) {
        const button = this.createElement(configs.tag, configs.style);
        button.setAttribute(this._modalAttrName, this._closeBtnAttrName);

        for (let i = 0; i < 2; i++) {
          const span = this.createElement('span');
          button.appendChild(span);
        }
        fenster.prepend(button);
      }
    };
    createButton();

    if (configs.modalType === 'modal') {
      //modal mode
      const header = this.createCustomElement(configs.header);
      checkIsExist(fenster, header);

      const title = this.createCustomElement(configs.title);
      checkIsExist(header, title);

      const content = this.createCustomElement(configs.content);
      checkIsExist(fenster, content);

      const footer = this.createCustomElement(configs.footer);
      checkIsExist(fenster, footer);
      //} else if (this.config.modalType === 'picture') {
    } else if (configs.modalType === 'picture') {
      //picture mode
      const { ...props } = this.config.picture;
      const picture = this.createElement(props.tag, props.style);
      picture.setAttribute(this._modalAttrName, this._pictureContainerAttrName);
      checkIsExist(fenster, picture);
    } else {
      console.error(
        `modalOchka: modalType configurations shall include "modal" or "picture"`,
      );
    }

    return modal;
  }

  createShadow() {
    if (this.config.shadow === true && this.config.shadowStyle == false) {
      console.error(
        'modalOchka: shadowStyle prop cannot be empty while shadow === true',
      );
    }

    const modal = document.querySelector(
      `[${this._modalAttrName}="${this.config.protoAttrName}"]`,
    );

    if (!this.config.shadow) {
      return false;
    } else {
      modal.classList.remove(this.config.modalStyle);

      const classes = this.config.shadowStyle.split(' ');
      classes.forEach((cssClass) => modal.classList.add(cssClass));
    }
  }

  eventHandler() {
    const modal = document.querySelector(
      `[${this._modalAttrName}="${this.config.protoAttrName}"]`,
    );
    const body = document.querySelector('body');
    const scrollBarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth;
    };
    const fenster = modal.querySelector(
      `[${this._modalAttrName}="${this._fensterAttrName}"]`,
    );
    //examination linkAttrName != false;

    const openBtn = Array.from(
      document.querySelectorAll(
        `[${this._modalAttrName}="${this.config.linkAttrName}"]`,
      ),
    );

    const closeButton = modal.querySelector(
      `[${this._modalAttrName}="${this._closeBtnAttrName}"]`,
    );

    /* opening */
    const open = () => {
      if (this.#fensterActive == true) {
        return;
      } else {
        this.#fensterActive = true;
        //prevent scrollBack to the up of the page:
        this.#scrollPosition = window.pageYOffset;
        body.style.top = -this.#scrollPosition + 'px';
        //prevent jumping due to scroll bar appearance:
        body.style.paddingRight = scrollBarWidth() + 'px';
        body.style.overflow = 'hidden';
        //body.classList.add('modal_opened');
        modal.classList.add('modal_active');
        fenster.addEventListener('click', inClick);
        setTimeout(() => {
          document.addEventListener('click', outClick);
        });
        //it must be written like that:
        //document.addEventListener('click', outClick);
      }
    };

    openBtn.forEach((element) => {
      element.addEventListener('click', () => {
        open();
      });
    });

    /* insert picture */
    const renderPicture = () => {
      const pictureContainer = modal.querySelector(
        `[${this._modalAttrName}="${this._pictureContainerAttrName}"]`,
      );

      const images = Array.from(
        document.querySelectorAll(
          `[${this._modalAttrName}="${this.config.linkAttrName}"]`,
        ),
      );

      for (let i = 0; i < images.length; i++) {
        images[i].addEventListener('click', () => {
          pictureContainer.innerHTML = images[i].outerHTML;
        });
      }
    };

    if (this.config.modalType === 'picture') {
      renderPicture();
    }

    /* closing */
    //auxilary func 'inClick' to control click happened on modal itself:
    function inClick(event) {
      event.stopPropagation();
    }
    //auxilary func 'outClick' to control click that happened on document, out of fenster;
    function outClick(event) {
      if (openBtn.includes(event.target)) {
        event.stopPropagation();
        return;
      }
      close();
    }

    const close = () => {
      this.#fensterActive = false;
      //prevent jumping due to scroll bar appearance:
      body.style.paddingRight = -scrollBarWidth() + 'px';
      body.style.overflow = 'initial';
      modal.classList.remove('modal_active');
      //body.classList.remove('modal_opened');

      fenster.removeEventListener('click', inClick);
      document.removeEventListener('click', outClick);
      //prevent scrollBack to the up of the page:
      window.scrollTo(0, this.#scrollPosition);
      //body.style.top = '';
    };

    closeButton.addEventListener('click', () => {
      close();
    });
  }
}

export default Modal;
