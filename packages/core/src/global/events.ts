
export class Events {
  private c: {[topic: string]: Function[]} = [] as any;

  /**
   * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
   *
   * @param {string} topic the topic to subscribe to
   * @param {function} handler the event handler
   */
  subscribe(topic: string, ...handlers: Function[]) {
    if (!this.c[topic]) {
      this.c[topic] = [];
    }
    handlers.forEach((handler) => {
      this.c[topic].push(handler);
    });
  }

  /**
   * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
   *
   * @param {string} topic the topic to unsubscribe from
   * @param {function} handler the event handler
   *
   * @return true if a handler was removed
   */
  unsubscribe(topic: string, handler: Function = null) {
    let t = this.c[topic];
    if (!t) {
      // Wasn't found, wasn't removed
      return false;
    }

    if (!handler) {
      // Remove all handlers for this topic
      delete this.c[topic];
      return true;
    }

    // We need to find and remove a specific handler
    let i = t.indexOf(handler);

    if (i < 0) {
      // Wasn't found, wasn't removed
      return false;
    }

    t.splice(i, 1);

    // If the channel is empty now, remove it from the channel map
    if (!t.length) {
      delete this.c[topic];
    }

    return true;
  }

  /**
   * Publish an event to the given topic.
   *
   * @param {string} topic the topic to publish to
   * @param {any} eventData the data to send as the event
   */
  publish(topic: string, ...args: any[]) {
    var t = this.c[topic];
    if (!t) {
      return null;
    }

    let responses: any[] = [];
    t.forEach((handler: any) => {
      responses.push(handler(...args));
    });
    return responses;
  }
}


export function setupEvents(win: Window, doc: Document) {
  const events = new Events();

  win.addEventListener('online', ev => events.publish('app:online', ev));

  win.addEventListener('offline', ev => events.publish('app:offline', ev));

  win.addEventListener('orientationchange', ev => events.publish('app:rotated', ev));

  win.addEventListener('statusTap', () => {
    const centerElm = doc.elementFromPoint(win.innerWidth / 2, win.innerHeight / 2);
    if (centerElm) {
      const scrollElm = centerElm.closest('ion-scroll');
      if (scrollElm) {
        scrollElm.componentOnReady(() => scrollElm.scrollToTop(300));
      }
    }

  });

  return events;
}
