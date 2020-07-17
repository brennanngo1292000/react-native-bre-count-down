import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState,
} from "react-native";
import _ from "lodash";
import { sprintf } from "sprintf-js";

const DEFAULT_DIGIT_STYLE = { backgroundColor: "#FAB913" };
const DEFAULT_DIGIT_TXT_STYLE = { color: "#000" };
const DEFAULT_TIME_LABEL_STYLE = { color: "#000" };
const DEFAULT_SEPARATOR_STYLE = { color: "#000" };
const DEFAULT_TIME_TO_SHOW = ["D", "H", "M", "S"];
const DEFAULT_TIME_LABELS = {
  d: "Days",
  h: "Hours",
  m: "Minutes",
  s: "Seconds",
};

const CountDown = (props) => {
  const {
    style,
    until,
    id,
    running,
    onFinish,
    digitStyle,
    digitTxtStyle,
    size,
    timeLabelStyle,
    size,
    separatorStyle,
    timeToShow,
    timeLabels,
    showSeparator,
    onPress,
  } = props;
  const [newUntil, setUntil] = useState(Math.max(until, 0));
  const [lastUntil, setLastUntil] = useState(null);
  const [wentBackgroundAt, setWentBackgroundAt] = useState(null);

  var _timer = setInterval(_updateTimer, 1000);

  const _handleAppStateChange = (currentAppState) => {
    if (currentAppState === "active" && wentBackgroundAt && running) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      setLastUntil(newUntil);
      setUntil(Math.max(0, newUntil - diff));
    }

    if (currentAppState === "background") {
      setWentBackgroundAt(Date.now());
    }
  };

  const _getTimeLeft = () => {
    return {
      seconds: newUntil % 60,
      minutes: parseInt(newUntil / 60, 10) % 60,
      hours: parseInt(newUntil / (60 * 60), 10) % 24,
      days: parseInt(newUntil / (60 * 60 * 24), 10),
    };
  };

  const _updateTimer = () => {
    if (lastUntil === newUntil || !running) {
      return;
    }
    if (newUntil === 1 || (newUntil === 0 && lastUntil !== 1)) {
      if (onFinish) onFinish();
      if (onChange) onChange(newUntil);
    }

    if (newUntil === 0) {
      setLastUntil(0);
      setUntil(0);
    } else {
      if (onChange) onChange(newUntil);
      setLastUntil(newUntil);
      setUntil(Math.max(0, newUntil - 1));
    }
  };

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      clearInterval(_timer);
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    setLastUntil(newUntil);
    setUntil(Math.max(until, 0));
  }, [until, id]);

  const _renderDigit = (d) => {
    return (
      <View
        style={[
          styles.digitCont,
          { width: size * 2.3, height: size * 2.6 },
          digitStyle,
        ]}
      >
        <Text style={[styles.digitTxt, { fontSize: size }, digitTxtStyle]}>
          {d}
        </Text>
      </View>
    );
  };

  const _renderLabel = (label) => {
    if (label) {
      return (
        <Text
          style={[styles.timeTxt, { fontSize: size / 1.8 }, timeLabelStyle]}
        >
          {label}
        </Text>
      );
    }
  };

  const _renderDoubleDigits = (label, digits) => {
    return (
      <View style={styles.doubleDigitCont}>
        <View style={styles.timeInnerCont}>{_renderDigit(digits)}</View>
        {_renderLabel(label)}
      </View>
    );
  };

  const _renderSeparator = () => {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text
          style={[
            styles.separatorTxt,
            { fontSize: size * 1.2 },
            separatorStyle,
          ]}
        >
          :
        </Text>
      </View>
    );
  };

  const _renderCountDown = () => {
    const { days, hours, minutes, seconds } = _getTimeLeft();
    const newTime = sprintf(
      "%02d:%02d:%02d:%02d",
      days,
      hours,
      minutes,
      seconds
    ).split(":");
    const Component = onPress ? TouchableOpacity : View;

    return (
      <Component style={styles.timeCont} onPress={onPress}>
        {timeToShow.includes("D")
          ? _renderDoubleDigits(timeLabels.d, newTime[0])
          : null}
        {showSeparator && timeToShow.includes("D") && timeToShow.includes("H")
          ? _renderSeparator()
          : null}
        {timeToShow.includes("H")
          ? _renderDoubleDigits(timeLabels.h, newTime[1])
          : null}
        {showSeparator && timeToShow.includes("H") && timeToShow.includes("M")
          ? _renderSeparator()
          : null}
        {timeToShow.includes("M")
          ? _renderDoubleDigits(timeLabels.m, newTime[2])
          : null}
        {showSeparator && timeToShow.includes("M") && timeToShow.includes("S")
          ? _renderSeparator()
          : null}
        {timeToShow.includes("S")
          ? _renderDoubleDigits(timeLabels.s, newTime[3])
          : null}
      </Component>
    );
  };

  return <View style={style}>{_renderCountDown()}</View>;
};

CountDown.defaultProps = {
  digitStyle: DEFAULT_DIGIT_STYLE,
  digitTxtStyle: DEFAULT_DIGIT_TXT_STYLE,
  timeLabelStyle: DEFAULT_TIME_LABEL_STYLE,
  timeLabels: DEFAULT_TIME_LABELS,
  separatorStyle: DEFAULT_SEPARATOR_STYLE,
  timeToShow: DEFAULT_TIME_TO_SHOW,
  showSeparator: false,
  until: 0,
  size: 15,
  running: true,
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timeTxt: {
    color: "white",
    marginVertical: 2,
    backgroundColor: "transparent",
  },
  timeInnerCont: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  digitCont: {
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  doubleDigitCont: {
    justifyContent: "center",
    alignItems: "center",
  },
  digitTxt: {
    color: "white",
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  separatorTxt: {
    backgroundColor: "transparent",
    fontWeight: "bold",
  },
});

CountDown.propTypes = {
  id: PropTypes.string,
  digitStyle: PropTypes.object,
  digitTxtStyle: PropTypes.object,
  timeLabelStyle: PropTypes.object,
  separatorStyle: PropTypes.object,
  timeToShow: PropTypes.array,
  showSeparator: PropTypes.bool,
  size: PropTypes.number,
  until: PropTypes.number,
  onChange: PropTypes.func,
  onPress: PropTypes.func,
  onFinish: PropTypes.func,
};

export default CountDown;
