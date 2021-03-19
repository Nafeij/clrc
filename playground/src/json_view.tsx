import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import JsonView from 'react-json-view';
import { parse } from 'clrc';

const Style = styled.div`
  overflow: auto;
  flex: 1;
  padding: 10px;
  background-color: rgb(222 222 222 / 0.2);
`;

const Wrapper = ({
  lrc,
  sortByStartTime,
}: {
  lrc: string;
  sortByStartTime: boolean;
}) => {
  const [lrcObject, setLrcObject] = useState(parse(lrc));

  useEffect(() => {
    const timer = window.setTimeout(
      () => setLrcObject(parse(lrc, { sortByStartTime })),
      300
    );
    return () => window.clearTimeout(timer);
  }, [lrc, sortByStartTime]);

  useEffect(() => {
    console.log(lrcObject);
  }, [lrcObject]);

  return (
    <Style>
      <JsonView src={lrcObject} />
    </Style>
  );
};

export default Wrapper;
