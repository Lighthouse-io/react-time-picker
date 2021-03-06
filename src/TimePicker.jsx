import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';
import detectElementOverflow from 'detect-element-overflow';

import Clock from 'react-clock/dist/entry.nostyle';

import TimeInput from './TimeInput';

import { isTime } from './shared/propTypes';

const allViews = ['hour', 'minute', 'second'];

export default class TimePicker extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isOpen !== prevState.propsIsOpen) {
      return {
        isOpen: nextProps.isOpen,
        propsIsOpen: nextProps.isOpen,
      };
    }

    return null;
  }

  state = {};

  componentDidMount() {
    document.addEventListener('mousedown', this.onClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClick);
  }

  onClick = (event) => {
    if (this.wrapper && !this.wrapper.contains(event.target)) {
      this.closeClock();
    }
  }

  openClock = () => {
    this.setState({ isOpen: true });
  }

  closeClock = () => {
    this.setState({ isOpen: false });
  }

  toggleClock = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  onChange = (value, closeClock = true) => {
    this.setState({
      isOpen: !closeClock,
    });

    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  }

  onFocus = () => {
    // Internet Explorer still fires onFocus on disabled elements
    if (this.props.disabled) {
      return;
    }
    this.openClock();
  }

  stopPropagation = event => event.stopPropagation();

  clear = () => this.onChange(null);

  renderInputs() {
    const { disabled } = this.props;

    return (
      <div className="react-time-picker__button">
        <TimeInput
          disabled={disabled}
          locale={this.props.locale}
          isClockOpen={this.state.isOpen}
          maxDetail={this.props.maxDetail}
          maxTime={this.props.maxTime}
          minTime={this.props.minTime}
          name={this.props.name}
          onChange={this.onChange}
          placeholder={this.placeholder}
          required={this.props.required}
          value={this.props.value}
        />
        <button
          className="react-time-picker__clear-button react-time-picker__button__icon"
          disabled={disabled}
          onClick={this.clear}
          onFocus={this.stopPropagation}
          type="button"
        >
          {this.props.clearIcon}
        </button>
        <button
          className="react-time-picker__clock-button react-time-picker__button__icon"
          disabled={disabled}
          onClick={this.toggleClock}
          onFocus={this.stopPropagation}
          onBlur={this.resetValue}
          type="button"
        >
          {this.props.clockIcon}
        </button>
      </div>
    );
  }

  renderClock() {
    const { isOpen } = this.state;

    if (isOpen === null) {
      return null;
    }

    const {
      clockClassName,
      className: timePickerClassName, // Unused, here to exclude it from clockProps
      maxDetail,
      onChange,
      ...clockProps
    } = this.props;

    const className = 'react-time-picker__clock';

    const maxDetailIndex = allViews.indexOf(maxDetail);

    return (
      <div
        className={mergeClassNames(
          className,
          `${className}--${isOpen ? 'open' : 'closed'}`,
        )}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          ref.classList.remove(`${className}--above-label`);

          const collisions = detectElementOverflow(ref, document.body);

          if (collisions.collidedBottom) {
            ref.classList.add(`${className}--above-label`);
          }
        }}
      >
        <Clock
          className={clockClassName}
          renderMinuteHand={maxDetailIndex > 0}
          renderSecondHand={maxDetailIndex > 1}
          {...clockProps}
        />
      </div>
    );
  }

  render() {
    const className = 'react-time-picker';

    return (
      <div
        className={mergeClassNames(
          className,
          `${className}--${this.state.isOpen ? 'open' : 'closed'}`,
          `${className}--${this.props.disabled ? 'disabled' : 'enabled'}`,
          this.props.className,
        )}
        onFocus={this.onFocus}
        ref={(ref) => { this.wrapper = ref; }}
      >
        {this.renderInputs()}
        {this.renderClock()}
      </div>
    );
  }
}

const ClockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
    <g stroke="black" strokeWidth="2" fill="none" >
      <circle cx="9.5" cy="9.5" r="7.5" />
      <path d="M9.5 4.5 v5 h4" />
    </g>
  </svg>
);

const ClearIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
    <g stroke="black" strokeWidth="2">
      <line x1="4" y1="4" x2="15" y2="15" />
      <line x1="15" y1="4" x2="4" y2="15" />
    </g>
  </svg>
);

TimePicker.defaultProps = {
  clearIcon: ClearIcon,
  clockIcon: ClockIcon,
  isOpen: null,
  maxDetail: 'minute',
};

TimePicker.propTypes = {
  ...Clock.propTypes,
  clockClassName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  clockIcon: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  clearIcon: PropTypes.node,
  disabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  locale: PropTypes.string,
  maxDetail: PropTypes.oneOf(allViews),
  maxTime: isTime,
  minTime: isTime,
  name: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([
    isTime,
    PropTypes.instanceOf(Date),
  ]),
};
