export default class Switch {

    constructor(container, eventClick, eventDown, eventUp, eventMove, callback) {
        this.container = container;
        this.eventClick = eventClick;
        this.eventDown = eventDown;
        this.eventUp = eventUp;
        this.eventMove = eventMove;
        this.callback = callback;
        this.drag = false;
        this.switchAnimate = false;
        this.active = false;

        this.init();
    }

    init() {
        this.container.querySelector('.container-range').addEventListener(this.eventDown, () => {
            this.drag = false;
        });

        this.container.querySelector('.container-range').addEventListener(this.eventMove, () => {
            this.drag = true;
        });

        this.container.querySelector('.container-range').addEventListener(this.eventUp, el => {
            if (!this.switchAnimate) {
                if (el.target.value) {
                    if (
                        (this.active && (el.target.value == 100 && this.drag)) ||
                        ((this.active && this.drag) && (el.target.value >= 49 && el.target.value != 100)) ||
                        (!this.active && el.target.value >= 49) ||
                        (el.target.value <= 49 && !this.drag)
                    ) {
                        if (!this.active) {
                            this.executeSwitch(true);
                        }
                        this.animateSwitch(100, true);
                    } else {
                        if (this.active) {
                            this.executeSwitch(false);
                        }
                        this.animateSwitch(0, false);
                    }
                } else {
                    this.executeSwitch(!this.active);
                    this.animateSwitch((this.active ? 0 : 100), !this.active);
                }
            }
        });

        this.container.querySelectorAll('.switch-label').forEach(switchLabel => {
            switchLabel.addEventListener(this.eventClick, el => {
                if (el.target.classList.contains('right') && !this.active) {
                    this.executeSwitch(true);
                    this.animateSwitch(100, true);
                } else if (el.target.classList.contains('left') && this.active) {
                    this.executeSwitch(false);
                    this.animateSwitch(0, false);
                }
            });
        });
    }

    executeSwitch(up) {
        window.setTimeout(() => {
            this.active = up;
            this.callback(this.active);
        }, 100);
        this.container.querySelectorAll('.switch-label').forEach(switchLabel => {
            switchLabel.classList.toggle('active');
        });
        this.container.querySelector('input[type=range]').classList.toggle('checked');
    }

    animateSwitch(value, up) {
        let range = this.container.querySelector('input[type=range]');
        let rangeValue = range.value;

        if ((rangeValue < 100 || !up) && (rangeValue > 0 || up)) {
            this.switchAnimate = true;
            let intervalId = setInterval(() => {
                if (up) {
                    rangeValue = parseInt(rangeValue) + 4;
                } else {
                    rangeValue = parseInt(rangeValue) - 4;
                }
                range.value = rangeValue;
                range.setAttribute('value', rangeValue);

                if (rangeValue < 1 || rangeValue > 99) {
                    clearInterval(intervalId);
                    this.switchAnimate = false;
                }
            }, 1)
        } else {
            range.setAttribute('value', rangeValue);
        }
    }
}